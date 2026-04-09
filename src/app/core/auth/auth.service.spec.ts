import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let assignSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    assignSpy = vi.spyOn(window.location, 'assign').mockImplementation(() => undefined);

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([{ path: 'login', children: [] }]), AuthService],
    });
  });

  afterEach(() => {
    assignSpy.mockRestore();
  });

  it('debe limpiar la sesión al cerrar sesión', () => {
    const service = TestBed.inject(AuthService);

    service.setSession({
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

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('partnershop.auth.session')).toBeNull();
    expect(assignSpy).toHaveBeenCalled();
  });
});
