import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { ShellNavigationService } from './shell-navigation.service';

describe('ShellNavigationService', () => {
  let authService: AuthService;
  let httpMock: HttpTestingController;
  let service: ShellNavigationService;
  let assignSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    assignSpy = vi.spyOn(window.location, 'assign').mockImplementation(() => undefined);

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
    assignSpy.mockRestore();
  });

  it('debe cargar y normalizar el menú autenticado desde backend', () => {
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

    const request = httpMock.expectOne('http://localhost:3000/api/auth/menu');

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

    expect(service.items()).toEqual([
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'dashboard',
        route: '/dashboard',
        description: 'Resumen ejecutivo',
      },
      {
        id: 'orders',
        label: 'Órdenes',
        icon: 'cart',
        route: '/orders',
        description: 'Seguimiento operativo',
      },
      {
        id: 'issue_category',
        label: 'Tipo de Comentarios',
        icon: 'settings',
        route: '/settings',
        description: 'Gestión de categorías de incidencias',
      },
      {
        id: 'users',
        label: 'Usuarios',
        icon: 'users',
        route: '/users',
        description: 'Usuarios y roles',
      },
    ]);
  });

  it('debe mantener el menú fallback si el endpoint falla', () => {
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

    const request = httpMock.expectOne('http://localhost:3000/api/auth/menu');
    request.flush({ message: 'error' }, { status: 500, statusText: 'Server Error' });

    expect(service.items()[0]?.id).toBe('dashboard');
    expect(service.items().some((item) => item.id === 'reports')).toBe(true);
  });
});
