import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { CardComponent } from '@shared/ui/card/card.component';
import { IconComponent } from '@shared/ui/icon/icon.component';

@Component({
  selector: 'ps-auth-callback-page',
  imports: [CardComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="flex min-h-screen items-center justify-center px-4 py-6">
      <ps-card class="w-full max-w-xl text-center" padding="lg" tone="brand">
        <div class="mx-auto flex max-w-md flex-col items-center">
          <div class="ps-shell-brand-mark">
            <ps-icon name="sparkles" [size]="20" />
          </div>
          <h1 class="mt-6 text-2xl font-bold tracking-[-0.03em] text-ink-950">
            Conectando tu sesión de PartnerShop
          </h1>
          <p class="mt-3 text-sm leading-7 text-ink-600">
            Estamos validando la respuesta de autenticación y preparando tu acceso al panel.
          </p>

          @if (errorMessage()) {
            <div class="mt-6 rounded-2xl border border-danger-500/25 bg-red-50 px-4 py-3 text-sm text-danger-500">
              {{ errorMessage() }}
            </div>
          }
        </div>
      </ps-card>
    </section>
  `,
})
export class AuthCallbackPageComponent {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly errorMessage = signal('');

  constructor() {
    void this.resolveCallback();
  }

  private async resolveCallback(): Promise<void> {
    const code = this.route.snapshot.queryParamMap.get('code');
    const state = this.route.snapshot.queryParamMap.get('state');

    if (!code) {
      this.errorMessage.set('La respuesta de autenticación no incluyó un código válido.');
      return;
    }

    try {
      await this.authService.handleAuthorizationCallback(code, state);
      await this.router.navigateByUrl('/dashboard');
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error
          ? error.message
          : 'No fue posible completar la autenticación de PartnerShop.',
      );
    }
  }
}
