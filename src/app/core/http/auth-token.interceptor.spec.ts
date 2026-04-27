import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  TestRequest,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '@core/auth/auth.service';
import { environment } from '@environments/environment';
import { authTokenInterceptor } from './auth-token.interceptor';

function createTestJwt(payload: Record<string, unknown>): string {
  const encode = (value: Record<string, unknown>) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(payload)}.signature`;
}

async function flushPromises(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

async function expectOneAsync(
  httpMock: HttpTestingController,
  url: string,
): Promise<TestRequest> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      return httpMock.expectOne(url);
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  throw lastError;
}

describe('authTokenInterceptor', () => {
  let authService: AuthService;
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
        AuthService,
      ],
    });

    authService = TestBed.inject(AuthService);
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe adjuntar un access token vigente a las llamadas del API', async () => {
    authService.setSession({
      accessToken: 'valid-token',
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
    });

    http.get(`${environment.apiBaseUrl}/orders`).subscribe();
    await flushPromises();

    const request = await expectOneAsync(httpMock, `${environment.apiBaseUrl}/orders`);
    expect(request.request.headers.get('Authorization')).toBe('Bearer valid-token');
    request.flush({});
  });

  it('debe renovar el token vencido antes de llamar al API', async () => {
    const nextAccessToken = createTestJwt({
      email: 'admin@partnershop.com',
      name: 'Admin',
      'cognito:groups': ['admin'],
    });

    authService.setSession({
      accessToken: 'expired-token',
      refreshToken: 'refresh-token',
      expiresAt: Date.now() - 1000,
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
    });

    http.get(`${environment.apiBaseUrl}/orders`).subscribe();
    await flushPromises();

    const tokenRequest = await expectOneAsync(
      httpMock,
      new URL('/oauth2/token', environment.cognito.domain).toString(),
    );
    expect(tokenRequest.request.headers.get('Authorization')).toBeNull();
    tokenRequest.flush({
      access_token: nextAccessToken,
      expires_in: 3600,
      token_type: 'Bearer',
    });
    await flushPromises();

    const apiRequest = await expectOneAsync(httpMock, `${environment.apiBaseUrl}/orders`);
    expect(apiRequest.request.headers.get('Authorization')).toBe(`Bearer ${nextAccessToken}`);
    apiRequest.flush({});
  });

  it('no debe adjuntar Authorization a URLs externas al API', () => {
    authService.setSession({
      accessToken: 'valid-token',
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
    });

    http.get('https://example.com/public').subscribe();

    const request = httpMock.expectOne('https://example.com/public');
    expect(request.request.headers.get('Authorization')).toBeNull();
    request.flush({});
  });
});
