import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  TestRequest,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { ShellNavigationService } from './shell-navigation.service';

describe('ShellNavigationService', () => {
  let authService: AuthService;
  let httpMock: HttpTestingController;
  let service: ShellNavigationService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', children: [] }]),
        AuthService,
        ShellNavigationService,
      ],
    });

    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(ShellNavigationService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  async function flushPromises(): Promise<void> {
    await Promise.resolve();
    await Promise.resolve();
  }

  async function expectOneAsync(url: string): Promise<TestRequest> {
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

  it('debe cargar y normalizar el menú autenticado desde backend', async () => {
    authService.setSession({
      accessToken: 'token',
      expiresAt: Date.now() + 1000,
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
    await flushPromises();

    const request = await expectOneAsync('http://localhost:3000/api/auth/menu');

    expect(request.request.method).toBe('GET');

    request.flush({
      statusCode: 200,
      data: [
        {
          key: 'dashboard',
          label: 'Dashboard',
          icon: 'dashboard',
          route: '/dashboard',
        },
        {
          key: 'orders',
          label: 'Órdenes',
          icon: 'shopping_cart',
          route: '/ordenes',
        },
        {
          key: 'issue_category',
          label: 'Tipo de Comentarios',
          icon: 'category',
          route: '/configuracion/categorias-novedad',
        },
        {
          key: 'users',
          label: 'Usuarios',
          icon: 'group',
          route: '/usuarios',
        },
      ],
      timestamp: '2026-04-11T22:09:31.906Z',
    });
    await flushPromises();

    expect(service.items()).toEqual([
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'dashboard',
        route: '/dashboard',
        description: 'Resumen ejecutivo',
        children: undefined,
      },
      {
        id: 'orders',
        label: 'Órdenes',
        icon: 'cart',
        route: '/orders',
        description: 'Total de órdenes',
        children: undefined,
      },
      {
        id: 'issue_category',
        label: 'Tipo de Comentarios',
        icon: 'settings',
        route: '/settings',
        description: 'Gestión de categorías de incidencias',
        children: undefined,
      },
      {
        id: 'users',
        label: 'Usuarios',
        icon: 'users',
        route: '/users',
        description: 'Usuarios y roles',
        children: undefined,
      },
    ]);
  });

  it('debe mantener el menú fallback si el endpoint falla', async () => {
    authService.setSession({
      accessToken: 'token',
      expiresAt: Date.now() + 1000,
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
    await flushPromises();

    const request = await expectOneAsync('http://localhost:3000/api/auth/menu');
    request.flush({ message: 'error' }, { status: 500, statusText: 'Server Error' });

    expect(service.items()[0]?.id).toBe('dashboard');
    expect(service.items().some((item) => item.id === 'reports')).toBe(true);
  });
});
