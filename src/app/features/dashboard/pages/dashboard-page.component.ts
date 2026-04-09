import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import { BadgeComponent } from '@shared/ui/badge/badge.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { CardComponent } from '@shared/ui/card/card.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { IconComponent } from '@shared/ui/icon/icon.component';

@Component({
  selector: 'ps-dashboard-page',
  imports: [BadgeComponent, ButtonComponent, CardComponent, EmptyStateComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 lg:space-y-7">
      <section
        class="ps-panel relative overflow-hidden px-6 py-7 sm:px-8 lg:px-10 lg:py-9"
      >
        <div
          class="absolute inset-y-0 right-0 hidden w-[34%] bg-[radial-gradient(circle_at_top,rgba(37,111,223,0.22),transparent_58%)] lg:block"
        ></div>

        <div class="relative grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.85fr)]">
          <div class="max-w-3xl">
            <div class="flex flex-wrap items-center gap-2">
              <ps-badge tone="brand">Panel PartnerShop</ps-badge>
              <ps-badge tone="gold">Base premium</ps-badge>
            </div>

            <h2 class="mt-5 text-3xl font-extrabold tracking-[-0.04em] text-ink-950 md:text-[3rem]">
              Operación clara, escalable y lista para crecer con producto real.
            </h2>

            <p class="mt-4 max-w-2xl text-sm leading-7 text-ink-600 md:text-[0.98rem]">
              La FASE 2 deja un lenguaje visual estable para PartnerShop: layout corporativo, tokens
              consistentes y una base de componentes que evita caer en UI genérica al crecer nuevas
              features.
            </p>

            <div class="mt-6 flex flex-wrap gap-3">
              <ps-button>
                Ver roadmap visual
                <ps-icon name="arrowUpRight" [size]="18" />
              </ps-button>
              <ps-button variant="secondary">Explorar componentes base</ps-button>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div class="ps-kpi-card">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Despachos</p>
              <div class="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p class="text-3xl font-extrabold tracking-[-0.04em] text-ink-950">24h-48h</p>
                  <p class="mt-2 text-sm text-ink-500">Ventana objetivo de despacho</p>
                </div>
                <span class="rounded-2xl bg-mint-100 p-3 text-mint-800">
                  <ps-icon name="box" [size]="20" />
                </span>
              </div>
            </div>

            <div class="ps-kpi-card">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Partners activos</p>
              <div class="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p class="text-3xl font-extrabold tracking-[-0.04em] text-ink-950">590+</p>
                  <p class="mt-2 text-sm text-ink-500">Red comercial preparada para escalar</p>
                </div>
                <span class="rounded-2xl bg-brand-100 p-3 text-brand-800">
                  <ps-icon name="users" [size]="20" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
        <ps-card>
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                Resumen de desempeño
              </p>
              <h3 class="mt-2 text-xl font-bold tracking-[-0.03em] text-ink-950">
                Jerarquía visual para KPI y analítica
              </h3>
            </div>

            <ps-badge tone="mint">Listo para integrar</ps-badge>
          </div>

          <div class="ps-grid-auto mt-6">
            <article class="ps-metric-card">
              <p class="text-sm font-medium text-ink-500">Órdenes gestionadas</p>
              <p class="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-ink-950">50.2K</p>
              <p class="mt-2 text-sm text-mint-700">+12.4% vs. ciclo anterior</p>
            </article>

            <article class="ps-metric-card">
              <p class="text-sm font-medium text-ink-500">Productos activos</p>
              <p class="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-ink-950">96</p>
              <p class="mt-2 text-sm text-brand-700">Catálogo preparado para filtros</p>
            </article>

            <article class="ps-metric-card">
              <p class="text-sm font-medium text-ink-500">Conversión asistida</p>
              <p class="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-ink-950">31%</p>
              <p class="mt-2 text-sm text-gold-700">Espacio para insights comerciales</p>
            </article>
          </div>

          <div
            class="mt-6 overflow-hidden rounded-[1.6rem] border border-ink-100 bg-gradient-to-b from-ink-50 to-white p-5"
          >
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-ink-900">Vista previa de crecimiento</p>
                <p class="text-sm text-ink-500">Zona preparada para gráficos en la FASE 4</p>
              </div>
              <ps-badge tone="neutral">Espacio de gráfico</ps-badge>
            </div>

            <div class="mt-6 grid h-[220px] grid-cols-12 items-end gap-3">
              @for (height of [48, 62, 54, 78, 88, 74, 96, 112, 94, 126, 104, 138]; track $index) {
                <div
                  class="rounded-t-[1rem] bg-gradient-to-t from-brand-600 via-brand-500 to-mint-300"
                  [style.height.px]="height"
                ></div>
              }
            </div>
          </div>
        </ps-card>

        <div class="space-y-6">
          <ps-card tone="subtle">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                  Validación de sesión
                </p>
                <h3 class="mt-2 text-xl font-bold tracking-[-0.03em] text-ink-950">
                  Estado autenticado actual
                </h3>
              </div>

              <ps-badge [tone]="authService.isAuthenticated() ? 'mint' : 'neutral'">
                {{ authService.isAuthenticated() ? 'Autenticado' : 'Sin sesión' }}
              </ps-badge>
            </div>

            <div class="mt-5 space-y-3 text-sm text-ink-600">
              <div class="flex items-center justify-between rounded-[1.2rem] bg-ink-50 px-4 py-3">
                <span>Usuario</span>
                <span class="font-semibold text-ink-900">
                  {{ authService.currentUser()?.email ?? 'Sin dato' }}
                </span>
              </div>
              <div class="flex items-center justify-between rounded-[1.2rem] bg-ink-50 px-4 py-3">
                <span>Rol principal</span>
                <span class="font-semibold text-ink-900">
                  {{ authService.primaryRole() }}
                </span>
              </div>
              <div class="flex items-center justify-between rounded-[1.2rem] bg-ink-50 px-4 py-3">
                <span>Grupos Cognito</span>
                <span class="font-semibold text-ink-900">
                  {{ authService.groups().length ? authService.groups().join(', ') : 'Sin grupos' }}
                </span>
              </div>
            </div>
          </ps-card>

          <ps-card tone="brand">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
              Sistema de diseño
            </p>
            <h3 class="mt-3 text-xl font-bold tracking-[-0.03em] text-ink-950">
              Tokens pensados para UI enterprise
            </h3>

            <div class="mt-5 space-y-3">
              <div class="flex items-center justify-between rounded-[1.2rem] bg-white/70 px-4 py-3">
                <span class="text-sm font-medium text-ink-700">Azul de confianza</span>
                <span class="h-7 w-7 rounded-full bg-brand-600"></span>
              </div>
              <div class="flex items-center justify-between rounded-[1.2rem] bg-white/70 px-4 py-3">
                <span class="text-sm font-medium text-ink-700">Verde operativo</span>
                <span class="h-7 w-7 rounded-full bg-mint-500"></span>
              </div>
              <div class="flex items-center justify-between rounded-[1.2rem] bg-white/70 px-4 py-3">
                <span class="text-sm font-medium text-ink-700">Dorado de acción</span>
                <span class="h-7 w-7 rounded-full bg-gold-400"></span>
              </div>
            </div>
          </ps-card>

          <ps-empty-state
            title="Base UI reusable lista"
            description="Botones, badges, cards, input, empty states y skeletons ya comparten tokens, sombras, radios y comportamiento responsive."
          >
            <ps-button variant="ghost">Ver librería base</ps-button>
          </ps-empty-state>
        </div>
      </section>
    </div>
  `,
})
export class DashboardPageComponent {
  protected readonly authService = inject(AuthService);
}
