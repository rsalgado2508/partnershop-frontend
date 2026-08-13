import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { signal } from '@angular/core';
import { AuthService } from './auth.service';
import { loginRedirectGuard } from './login-redirect.guard';

describe('loginRedirectGuard', () => {
  it('debe permitir entrar a /login cuando no hay sesión', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: signal(false),
          },
        },
      ],
    });

    const result = TestBed.runInInjectionContext(() => loginRedirectGuard({} as never, {} as never));
    expect(result).toBe(true);
  });

  it('debe redirigir al dashboard cuando ya existe sesión', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: signal(true),
          },
        },
      ],
    });

    const router = TestBed.inject(Router);
    const result = TestBed.runInInjectionContext(() => loginRedirectGuard({} as never, {} as never));

    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/dashboard');
  });
});
