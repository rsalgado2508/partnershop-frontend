import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import { BadgeComponent } from '@shared/ui/badge/badge.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { CardComponent } from '@shared/ui/card/card.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { DailyFollowUpSectionComponent } from '../components/daily-follow-up-section.component';

@Component({
  selector: 'ps-dashboard-page',
  imports: [
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    DailyFollowUpSectionComponent,
    EmptyStateComponent,
    IconComponent,
  ],
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

      <ps-daily-follow-up-section />

    </div>
  `,
})
export class DashboardPageComponent {
  protected readonly authService = inject(AuthService);
}
