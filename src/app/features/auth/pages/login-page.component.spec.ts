import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LoginPageComponent } from './login-page.component';
import { AuthService } from '@core/auth/auth.service';

describe('LoginPageComponent', () => {
  it('debe iniciar redirección con Cognito en el flujo principal', async () => {
    const loginWithCognito = vi.fn().mockResolvedValue(undefined);

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        {
          provide: AuthService,
          useValue: {
            loginWithCognito,
          },
        },
        {
          provide: Router,
          useValue: {
            navigateByUrl: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();

    await fixture.componentInstance['continueWithCognito']();

    expect(loginWithCognito).toHaveBeenCalled();
  });
});
