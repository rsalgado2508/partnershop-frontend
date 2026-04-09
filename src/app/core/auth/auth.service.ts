import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '@environments/environment';
import { firstValueFrom } from 'rxjs';
import { AuthSession } from './auth-session.model';
import { AuthenticatedUser } from './authenticated-user.model';

interface CognitoTokenResponse {
  access_token: string;
  expires_in: number;
  id_token?: string;
  refresh_token?: string;
  token_type: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly session = signal<AuthSession | null>(null);
  private readonly storageKey = 'partnershop.auth.session';
  private readonly pkceVerifierKey = 'partnershop.auth.pkce.verifier';
  private readonly pkceStateKey = 'partnershop.auth.pkce.state';

  readonly isAuthenticated = computed(() => this.session() !== null);
  readonly roles = computed(() => this.session()?.roles ?? []);
  readonly groups = computed(() => this.session()?.groups ?? []);
  readonly accessToken = computed(() => this.session()?.accessToken ?? null);
  readonly currentUser = computed(() => this.session()?.user ?? null);
  readonly primaryRole = computed(() => this.currentUser()?.primaryRole ?? 'Sin rol');

  get snapshot(): AuthSession | null {
    return this.session();
  }

  constructor() {
    this.restoreSession();
  }

  setSession(session: AuthSession | null): void {
    this.session.set(session);
    this.persistSession(session);
  }

  async loginWithCognito(): Promise<void> {
    await this.startAuthorizationCodeFlow();
  }

  async startAuthorizationCodeFlow(): Promise<void> {
    this.assertCognitoConfig();

    const verifier = this.createRandomString(64);
    const state = this.createRandomString(32);
    const challenge = await this.createCodeChallenge(verifier);

    sessionStorage.setItem(this.pkceVerifierKey, verifier);
    sessionStorage.setItem(this.pkceStateKey, state);

    const authorizeUrl = new URL('/oauth2/authorize', environment.cognito.domain);
    authorizeUrl.searchParams.set('client_id', environment.cognito.clientId);
    authorizeUrl.searchParams.set('response_type', environment.cognito.responseType);
    authorizeUrl.searchParams.set('scope', environment.cognito.scope);
    authorizeUrl.searchParams.set('redirect_uri', environment.cognito.redirectUri);
    authorizeUrl.searchParams.set('code_challenge_method', 'S256');
    authorizeUrl.searchParams.set('code_challenge', challenge);
    authorizeUrl.searchParams.set('state', state);

    window.location.assign(authorizeUrl.toString());
  }

  async handleAuthorizationCallback(code: string, state: string | null): Promise<void> {
    this.assertCognitoConfig();

    const storedVerifier = sessionStorage.getItem(this.pkceVerifierKey);
    const storedState = sessionStorage.getItem(this.pkceStateKey);

    if (!storedVerifier || !storedState || state !== storedState) {
      throw new Error('No fue posible validar el estado de autenticación de PartnerShop.');
    }

    const tokenUrl = new URL('/oauth2/token', environment.cognito.domain).toString();

    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('client_id', environment.cognito.clientId)
      .set('code', code)
      .set('redirect_uri', environment.cognito.redirectUri)
      .set('code_verifier', storedVerifier);

    const tokenResponse = await firstValueFrom(
      this.http.post<CognitoTokenResponse>(tokenUrl, body.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }),
    );

    const payload = this.decodeJwtPayload(tokenResponse.id_token ?? tokenResponse.access_token);
    const groups = this.extractGroups(payload);
    const roles = this.normalizeRoles(groups);
    const user = this.buildAuthenticatedUser({
      email: String(payload['email'] ?? ''),
      name: String(payload['name'] ?? payload['email'] ?? 'Usuario PartnerShop'),
      roles,
      groups,
    });

    const nextSession: AuthSession = {
      accessToken: tokenResponse.access_token,
      idToken: tokenResponse.id_token,
      refreshToken: tokenResponse.refresh_token,
      expiresAt: Date.now() + tokenResponse.expires_in * 1000,
      roles,
      groups,
      user,
    };

    this.setSession(nextSession);
    sessionStorage.removeItem(this.pkceVerifierKey);
    sessionStorage.removeItem(this.pkceStateKey);
  }

  logout(): void {
    this.setSession(null);
    const logoutUrl = new URL('/logout', environment.cognito.domain);
    logoutUrl.searchParams.set('client_id', environment.cognito.clientId);
    logoutUrl.searchParams.set('logout_uri', environment.cognito.logoutUri);
    window.location.assign(logoutUrl.toString());
  }

  hasAnyRole(expectedRoles: string[]): boolean {
    if (!expectedRoles.length) {
      return true;
    }

    const userRoles = this.roles();
    return expectedRoles.some((role) => userRoles.includes(role));
  }

  private restoreSession(): void {
    const serialized = localStorage.getItem(this.storageKey);

    if (!serialized) {
      return;
    }

    try {
      const parsed = JSON.parse(serialized) as AuthSession;

      if (parsed.expiresAt > Date.now()) {
        this.session.set(parsed);
        return;
      }
    } catch {
      localStorage.removeItem(this.storageKey);
    }

    localStorage.removeItem(this.storageKey);
  }

  private persistSession(session: AuthSession | null): void {
    if (!session) {
      localStorage.removeItem(this.storageKey);
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(session));
  }

  private assertCognitoConfig(): void {
    if (!environment.cognito.domain || !environment.cognito.clientId) {
      throw new Error(
        'Falta configurar el dominio Hosted UI final de Cognito en environments para activar el flujo real.',
      );
    }
  }

  private extractGroups(payload: Record<string, unknown>): string[] {
    return Array.isArray(payload['cognito:groups'])
      ? payload['cognito:groups'].filter((group): group is string => typeof group === 'string')
      : [];
  }

  private normalizeRoles(groups: string[]): string[] {
    if (!groups.length) {
      return ['administrador'];
    }

    return groups.map((group) => group.trim().toLowerCase()).filter(Boolean);
  }

  private buildAuthenticatedUser(params: {
    email: string;
    name: string;
    roles: string[];
    groups: string[];
  }): AuthenticatedUser {
    const safeName = params.name.trim() || params.email || 'Usuario PartnerShop';

    return {
      email: params.email,
      name: this.toDisplayName(safeName),
      initials: this.buildInitials(safeName, params.email),
      roles: params.roles,
      primaryRole: this.toRoleLabel(params.roles[0] ?? 'administrador'),
      groups: params.groups,
    };
  }

  private buildInitials(name: string, email: string): string {
    const source = name.trim() || email.trim() || 'PS';
    const parts = source.split(/[\s@._-]+/).filter(Boolean);
    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'PS';
  }

  private toDisplayName(value: string): string {
    return value
      .split(/[\s._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private toRoleLabel(role: string): string {
    return role
      .split(/[\s_-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private createRandomString(length: number): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(bytes)
      .map((value) => alphabet[value % alphabet.length])
      .join('');
  }

  private async createCodeChallenge(verifier: string): Promise<string> {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return this.base64UrlEncode(new Uint8Array(digest));
  }

  private base64UrlEncode(bytes: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...bytes));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  private decodeJwtPayload(token: string): Record<string, unknown> {
    const payload = token.split('.')[1];

    if (!payload) {
      return {};
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized);
    return JSON.parse(decoded) as Record<string, unknown>;
  }
}
