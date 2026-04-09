import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import { BadgeComponent } from '@shared/ui/badge/badge.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { IconComponent } from '@shared/ui/icon/icon.component';

@Component({
  selector: 'ps-login-page',
  imports: [BadgeComponent, ButtonComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div class="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center">
        <div class="w-full max-w-[1040px]">
          <div class="ps-panel relative overflow-hidden px-5 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-7">
            <div class="absolute right-0 top-0 h-52 w-52 rounded-full bg-brand-200/30 blur-3xl"></div>
            <div class="absolute bottom-0 left-0 h-44 w-44 rounded-full bg-mint-200/20 blur-3xl"></div>

            <div class="relative grid gap-5 lg:grid-cols-[minmax(440px,540px)_minmax(0,1fr)]">
              <div class="rounded-[1.75rem] border border-white/70 bg-white/88 p-6 shadow-[0_22px_56px_-34px_rgba(15,35,65,0.24)] sm:p-8">
                <div class="flex items-center gap-3">
                  <span class="ps-shell-brand-mark h-11 w-11 rounded-[1.2rem]">
                    <ps-icon name="sparkles" [size]="18" />
                  </span>

                  <div>
                    <p class="text-sm font-semibold tracking-[0.18em] text-brand-800 uppercase">
                      PartnerShop
                    </p>
                    <p class="text-sm text-ink-500">Consola interna</p>
                  </div>
                </div>

                <div class="mt-6 flex flex-wrap items-center gap-2">
                  <ps-badge tone="brand">Acceso centralizado</ps-badge>
                  <ps-badge tone="mint">Hosted UI + PKCE</ps-badge>
                </div>

                <h1 class="mt-5 text-3xl font-extrabold tracking-[-0.04em] text-ink-950 sm:text-[2.6rem]">
                  Continúa con el acceso seguro de PartnerShop.
                </h1>

                <p class="mt-3 max-w-lg text-sm leading-7 text-ink-600">
                  La autenticación principal se gestiona con AWS Cognito Hosted UI. Al continuar,
                  serás redirigido a un acceso seguro centralizado y regresarás al panel una vez
                  validada tu sesión.
                </p>

                @if (submitError()) {
                  <div class="mt-6 rounded-2xl border border-danger-500/25 bg-red-50 px-4 py-3 text-sm text-danger-500">
                    {{ submitError() }}
                  </div>
                }

                <div class="mt-8 space-y-4">
                  <ps-button [disabled]="isSubmittingCognito()" type="button" [block]="true" (click)="continueWithCognito()">
                    {{ isSubmittingCognito() ? 'Redirigiendo...' : 'Continuar con Cognito' }}
                  </ps-button>

                  <div class="rounded-[1.35rem] border border-ink-100 bg-ink-50/80 px-4 py-4">
                    <div class="flex items-start gap-3">
                      <span class="mt-0.5 text-brand-700">
                        <ps-icon name="lock" [size]="18" />
                      </span>
                      <div class="text-sm leading-6 text-ink-600">
                        <p class="font-semibold text-ink-900">Flujo principal</p>
                        <p>
                          <code>/login</code> → Cognito Hosted UI → <code>/auth/callback</code> →
                          <code>/dashboard</code>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mt-6 flex flex-wrap gap-2 text-xs text-ink-500">
                  <span class="rounded-full bg-ink-100 px-3 py-1.5">OAuth 2.0</span>
                  <span class="rounded-full bg-ink-100 px-3 py-1.5">Authorization Code</span>
                  <span class="rounded-full bg-ink-100 px-3 py-1.5">PKCE</span>
                </div>
              </div>

              <div class="hidden lg:flex">
                <div class="ps-panel-soft flex w-full flex-col justify-between overflow-hidden p-5">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                        Contexto visual
                      </p>
                      <h2 class="mt-2 text-lg font-bold tracking-[-0.03em] text-ink-950">
                        Consola PartnerShop
                      </h2>
                    </div>

                    <div class="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">
                      Seguro
                    </div>
                  </div>

                  <div class="mt-5 grid gap-3">
                    <div class="grid grid-cols-2 gap-3">
                      <div class="rounded-[1.35rem] border border-white/70 bg-white/90 p-4">
                        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">
                          Pedidos
                        </p>
                        <p class="mt-3 text-2xl font-extrabold tracking-[-0.04em] text-ink-950">
                          148
                        </p>
                        <p class="mt-2 text-xs text-mint-700">Seguimiento diario</p>
                      </div>

                      <div class="rounded-[1.35rem] border border-white/70 bg-white/90 p-4">
                        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">
                          Aliados
                        </p>
                        <p class="mt-3 text-2xl font-extrabold tracking-[-0.04em] text-ink-950">
                          32
                        </p>
                        <p class="mt-2 text-xs text-brand-700">Acceso centralizado</p>
                      </div>
                    </div>

                    <div class="rounded-[1.45rem] border border-white/70 bg-white/90 p-4">
                      <div class="flex items-center justify-between">
                        <div>
                          <p class="text-sm font-semibold text-ink-900">Actividad operativa</p>
                          <p class="text-xs text-ink-500">Preview sutil del panel</p>
                        </div>
                        <ps-icon name="chart" [size]="18" class="text-brand-700" />
                      </div>

                      <div class="mt-5 grid h-[160px] grid-cols-10 items-end gap-2">
                        @for (height of [28, 44, 36, 56, 62, 58, 72, 68, 88, 84]; track $index) {
                          <div
                            class="rounded-t-[0.8rem] bg-gradient-to-t from-brand-600 via-brand-500 to-mint-300"
                            [style.height.px]="height"
                          ></div>
                        }
                      </div>
                    </div>
                  </div>

                  <p class="mt-5 text-xs leading-6 text-ink-500">
                    El acceso real vive fuera de Angular y vuelve por callback con una sesión controlada.
                  </p>
                </div>
              </div>
            </div>
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
