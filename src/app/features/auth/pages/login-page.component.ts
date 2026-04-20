import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import { ButtonComponent } from '@shared/ui/button/button.component';

@Component({
  selector: 'ps-login-page',
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(45,121,255,0.16),_transparent_36%),linear-gradient(180deg,_#f7f9fc_0%,_#eef3f8_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div class="absolute inset-x-0 top-0 h-px bg-white/70"></div>
      <div class="absolute left-1/2 top-12 h-56 w-56 -translate-x-1/2 rounded-full bg-brand-200/30 blur-3xl"></div>

      <div class="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center">
        <div class="w-full max-w-[460px]">
          <div class="rounded-[2rem] border border-white/80 bg-white/88 px-6 py-8 shadow-[0_30px_80px_-38px_rgba(15,35,65,0.28)] backdrop-blur-xl sm:px-8 sm:py-10">
            <div class="flex justify-center">
              <img
                src="https://www.partnershopcol.com/assets/partnershop_logo_clean_2x.webp"
                alt="PartnerShop"
                class="h-auto w-full max-w-[280px]"
              />
            </div>

            <div class="mt-8 text-center">
              <p class="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-brand-700">
                Centro de control
              </p>
              <h1 class="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-ink-950 sm:text-[2.5rem]">
                Acceso seguro
              </h1>
              <p class="mt-3 text-sm leading-7 text-ink-600">
                Ingresa con tu cuenta autorizada para continuar en la consola de PartnerShop.
              </p>
            </div>

            @if (submitError()) {
              <div class="mt-6 rounded-2xl border border-danger-500/20 bg-red-50/90 px-4 py-3 text-sm text-danger-500">
                {{ submitError() }}
              </div>
            }

            <div class="mt-8">
              <ps-button
                [disabled]="isSubmittingCognito()"
                type="button"
                [block]="true"
                size="lg"
                (click)="continueWithCognito()"
              >
                {{ isSubmittingCognito() ? 'Redirigiendo...' : 'Continuar' }}
              </ps-button>
            </div>

            <p class="mt-6 text-center text-xs leading-6 text-ink-500">
              Serás redirigido al proveedor de autenticación de PartnerShop.
            </p>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class LoginPageComponent {
  protected readonly authService = inject(AuthService);

  protected readonly isSubmittingCognito = signal(false);
  protected readonly submitError = signal('');

  protected async continueWithCognito(): Promise<void> {
    this.submitError.set('');
    this.isSubmittingCognito.set(true);

    try {
      await this.authService.loginWithCognito();
    } catch (error) {
      this.submitError.set(
        error instanceof Error
          ? error.message
          : 'No fue posible redirigir al acceso centralizado de Cognito.',
      );
      this.isSubmittingCognito.set(false);
    }
  }
}
