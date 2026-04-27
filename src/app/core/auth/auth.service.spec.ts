import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '@environments/environment';
import { AuthService } from './auth.service';
import { AuthSession } from './auth-session.model';

function createTestJwt(payload: Record<string, unknown>): string {
  const encode = (value: Record<string, unknown>) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(payload)}.signature`;
}

function createSession(overrides: Partial<AuthSession> = {}): AuthSession {
  return {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresAt: Date.now() + 120_000,
    roles: ['admin'],
    groups: ['admin'],
    user: {
      email: 'admin@partnershop.com',
      name: 'Admin',
      initials: 'A',
      roles: ['admin'],
      primaryRole: 'Admin',
      groups: ['admin'],
    },
    ...overrides,
  };
}

describe('AuthService', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', children: [] }]),
        AuthService,
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe limpiar la sesión al cerrar sesión', () => {
    const service = TestBed.inject(AuthService);
    const redirectSpy = vi
      .spyOn(service as unknown as { redirectTo: (url: string) => void }, 'redirectTo')
      .mockImplementation(() => undefined);

    service.setSession(createSession());

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('partnershop.auth.session')).toBeNull();
    expect(redirectSpy).toHaveBeenCalled();
  });

  it('debe reutilizar el access token cuando la sesión sigue vigente', async () => {
    const service = TestBed.inject(AuthService);

    service.setSession(createSession({ accessToken: 'valid-token' }));

    await expect(service.getValidAccessToken()).resolves.toBe('valid-token');
    httpMock.expectNone(new URL('/oauth2/token', environment.cognito.domain).toString());
  });

  it('debe renovar el access token con refresh token cuando está por vencer', async () => {
    const service = TestBed.inject(AuthService);
    const tokenUrl = new URL('/oauth2/token', environment.cognito.domain).toString();
    const nextAccessToken = createTestJwt({
      email: 'admin@partnershop.com',
      name: 'Admin',
      'cognito:groups': ['admin'],
    });

    service.setSession(
      createSession({
        accessToken: 'expired-token',
        expiresAt: Date.now() - 1000,
      }),
    );

    const tokenPromise = service.getValidAccessToken();
    const request = httpMock.expectOne(tokenUrl);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toContain('grant_type=refresh_token');
    expect(request.request.body).toContain('refresh_token=refresh-token');

    request.flush({
      access_token: nextAccessToken,
      expires_in: 3600,
      token_type: 'Bearer',
    });

    await expect(tokenPromise).resolves.toBe(nextAccessToken);
    expect(service.accessToken()).toBe(nextAccessToken);
    expect(service.snapshot?.refreshToken).toBe('refresh-token');
  });

  it('debe limpiar la sesión si vence y no hay refresh token', async () => {
    const service = TestBed.inject(AuthService);

    service.setSession(
      createSession({
        refreshToken: undefined,
        expiresAt: Date.now() - 1000,
      }),
    );

    await expect(service.getValidAccessToken()).resolves.toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('partnershop.auth.session')).toBeNull();
  });
});
