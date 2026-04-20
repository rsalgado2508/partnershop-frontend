import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { BadgeComponent } from '@shared/ui/badge/badge.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { CardComponent } from '@shared/ui/card/card.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import { Subject, catchError, map, of, startWith, switchMap } from 'rxjs';
import {
  ChartSeriesKey,
  DailyFollowUpChartComponent,
  filterRowsBySeries,
} from './daily-follow-up-chart.component';
import { DailyFollowUpRepository } from '../data-access/daily-follow-up.repository';
import { DailyFollowUpRow } from '../data-access/daily-follow-up.models';

type DailyFollowUpViewState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: DailyFollowUpRow[] };

interface KpiCard {
  label: string;
  value: string;
  caption: string;
  toneClass: string;
  badgeLabel: string;
}

const INTEGER_FORMATTER = new Intl.NumberFormat('es-CO');
const DECIMAL_FORMATTER = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

@Component({
  selector: 'ps-daily-follow-up-section',
  imports: [
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    DailyFollowUpChartComponent,
    EmptyStateComponent,
    IconComponent,
    SkeletonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-5">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-3xl">
          <div class="flex flex-wrap items-center gap-2">
            <ps-badge tone="brand">Seguimiento diario</ps-badge>
            <!--ps-badge tone="mint">Backend conectado</ps-badge-->
          </div>

          <h3 class="mt-4 text-2xl font-extrabold tracking-[-0.04em] text-ink-950 md:text-[2.4rem]">
            Evolución de órdenes en seguimiento y guías pendientes
          </h3>

          <p class="mt-3 max-w-2xl text-sm leading-7 text-ink-600">
            Vista ejecutiva con tendencia operativa, corte diario y detalle consolidado por fecha
            de seguimiento.
          </p>
        </div>

        @if (latestRow()) {
          <div class="rounded-[1.35rem] border border-ink-100 bg-white/85 px-4 py-3 text-sm text-ink-600 shadow-[0_18px_40px_-30px_rgba(15,35,65,0.24)]">
            <span class="font-semibold text-ink-900">Último corte:</span>
            {{ latestRow()!.diaSeguimientoLabel }} {{ latestRow()!.fechaSeguimientoLabel }}
          </div>
        }
      </div>

      @switch (stateStatus()) {
        @case ('loading') {
          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            @for (item of [1, 2, 3, 4, 5]; track item) {
              <ps-card padding="sm">
                <ps-skeleton width="42%" height="0.9rem" />
                <div class="mt-4">
                  <ps-skeleton width="64%" height="2.1rem" />
                </div>
                <div class="mt-3">
                  <ps-skeleton width="78%" height="0.85rem" />
                </div>
              </ps-card>
            }
          </div>

          <ps-card>
            <div class="flex items-center justify-between gap-3">
              <div class="space-y-3">
                <ps-skeleton width="9rem" height="0.9rem" />
                <ps-skeleton width="18rem" height="1.6rem" />
              </div>
              <ps-skeleton width="6rem" height="2rem" />
            </div>

            <div class="mt-8 space-y-4">
              <ps-skeleton width="100%" height="14rem" />
              <div class="grid grid-cols-4 gap-4">
                @for (item of [1, 2, 3, 4]; track item) {
                  <ps-skeleton width="100%" height="0.9rem" />
                }
              </div>
            </div>
          </ps-card>

          <ps-card>
            <div class="space-y-3">
              <ps-skeleton width="10rem" height="0.9rem" />
              <ps-skeleton width="20rem" height="1.5rem" />
            </div>

            <div class="mt-6 space-y-4">
              @for (item of [1, 2, 3, 4, 5]; track item) {
                <ps-skeleton width="100%" height="2.8rem" />
              }
            </div>
          </ps-card>
        }

        @case ('error') {
          <ps-card>
            <ps-empty-state
              icon="chart"
              title="No fue posible cargar el seguimiento diario"
              [description]="errorMessage()"
            >
              <ps-button variant="secondary" (click)="reload()">
                Reintentar consulta
                <ps-icon name="arrowUpRight" [size]="18" />
              </ps-button>
            </ps-empty-state>
          </ps-card>
        }

        @case ('success') {
          @if (rows().length) {
            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              @for (item of kpiCards(); track item.label) {
                <ps-card padding="sm">
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <p class="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
                        {{ item.label }}
                      </p>
                      <p class="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-ink-950">
                        {{ item.value }}
                      </p>
                    </div>
                    <span class="rounded-2xl px-3 py-2 text-xs font-semibold" [class]="item.toneClass">
                      {{ item.badgeLabel }}
                    </span>
                  </div>
                  <p class="mt-3 text-sm text-ink-500">{{ item.caption }}</p>
                </ps-card>
              }
            </div>

            <ps-card>
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                    Gráfica de tendencia
                  </p>
                  <h4 class="mt-2 text-xl font-bold tracking-[-0.03em] text-ink-950">
                    Evolución del backlog operativo diario
                  </h4>
                  <p class="mt-2 text-sm text-ink-600">
                    Visual consolidada con selector por rango para alternar entre
                    <span class="font-semibold text-ink-900">Guía gen/pendi &gt; 2 días</span>,
                    <span class="font-semibold text-ink-900">7 a 15 días</span>,
                    <span class="font-semibold text-ink-900">15 a 20 días</span> y
                    <span class="font-semibold text-ink-900">más de 20 días</span>.
                  </p>
                </div>

                <div class="rounded-[1.35rem] bg-ink-50 px-4 py-3 text-right">
                  <p class="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
                    Rango analizado
                  </p>
                  <p class="mt-2 text-sm font-semibold text-ink-900">{{ dateRangeLabel() }}</p>
                </div>
              </div>

              <div class="mt-6">
                <ps-daily-follow-up-chart
                  [rows]="rows()"
                  [selectedSeries]="selectedSeries()"
                  (selectedSeriesChange)="selectedSeries.set($event)"
                />
              </div>
            </ps-card>

            <ps-card>
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                    Tabla consolidada
                  </p>
                  <h4 class="mt-2 text-xl font-bold tracking-[-0.03em] text-ink-950">
                    Detalle por fecha de seguimiento
                  </h4>
                </div>

                <ps-badge tone="neutral">{{ filteredRows().length }} registros</ps-badge>
              </div>

              <div class="mt-6 overflow-x-auto">
                <table class="min-w-[1040px] w-full border-separate border-spacing-0">
                  <thead>
                    <tr>
                      @for (column of tableColumns; track column) {
                        <th class="border-b border-ink-100 bg-ink-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ink-500 first:rounded-tl-[1.1rem] last:rounded-tr-[1.1rem]">
                          {{ column }}
                        </th>
                      }
                    </tr>
                  </thead>

                  <tbody>
                    @for (row of filteredRows(); track row.fechaSeguimiento) {
                      <tr class="transition-colors duration-200 hover:bg-brand-50/35">
                        <td class="border-b border-ink-100 px-4 py-4 text-sm font-semibold text-ink-900">
                          {{ row.fechaSeguimientoLabel }}
                        </td>
                        <td class="border-b border-ink-100 px-4 py-4 text-sm text-ink-700">
                          {{ row.diaSeguimientoLabel }}
                        </td>
                        <td class="border-b border-ink-100 px-4 py-4 text-right text-sm font-medium tabular-nums text-ink-900">
                          {{ formatInteger(row.totalEntre15y20) }}
                        </td>
                        <td class="border-b border-ink-100 px-4 py-4 text-right text-sm font-medium tabular-nums text-ink-900">
                          {{ formatInteger(row.totalEntre7y15) }}
                        </td>
                        <td class="border-b border-ink-100 px-4 py-4 text-right text-sm font-medium tabular-nums text-ink-900">
                          {{ formatInteger(row.totalGuiasMayorA2Dias) }}
                        </td>
                        <td class="border-b border-ink-100 px-4 py-4 text-right text-sm font-medium tabular-nums text-ink-900">
                          {{ formatInteger(row.totalMayorA20) }}
                        </td>
                        <td class="border-b border-ink-100 px-4 py-4 text-right text-sm font-medium tabular-nums text-ink-900">
                          {{ formatDecimal(row.promedio) }}
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </ps-card>
          } @else {
            <ps-card>
              <ps-empty-state
                icon="chart"
                title="Sin datos de seguimiento diario"
                description="El backend respondió correctamente, pero no hay registros para mostrar en la gráfica ni en la tabla."
              />
            </ps-card>
          }
        }
      }
    </section>
  `,
})
export class DailyFollowUpSectionComponent {
  protected readonly tableColumns = [
    'Fecha de seguimiento',
    'Día de seguimiento',
    '15-20 días',
    '7-15 días',
    'Guía gen/pendi > 2 días',
    'Más de 20',
    'Promedio',
  ];

  private readonly repository = inject(DailyFollowUpRepository);
  private readonly reload$ = new Subject<void>();
  protected readonly selectedSeries = signal<ChartSeriesKey>('guiasMayorA2Dias');

  protected readonly viewState = toSignal(
    this.reload$.pipe(
      startWith(undefined),
      switchMap(() =>
        this.repository.list().pipe(
          map((data): DailyFollowUpViewState => ({ status: 'success', data })),
          startWith({ status: 'loading' } as DailyFollowUpViewState),
          catchError((error: unknown) => {
            console.error('Daily follow-up dashboard load failed', error);

            const message =
              error instanceof HttpErrorResponse
                ? `El servicio respondió con ${error.status || 'error'} ${error.statusText || ''}`.trim()
                : 'Revisa la conexión con el servicio o intenta nuevamente en unos segundos.';

            return of({
              status: 'error',
              message,
            } as DailyFollowUpViewState);
          }),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as DailyFollowUpViewState },
  );

  protected readonly stateStatus = computed(() => this.viewState().status);
  protected readonly rows = computed(() => {
    const state = this.viewState();
    return state.status === 'success' ? state.data : [];
  });
  protected readonly latestRow = computed(() => {
    const rows = this.rows();
    return rows.length ? rows[rows.length - 1] : null;
  });
  protected readonly errorMessage = computed(() => {
    const state = this.viewState();
    return state.status === 'error' ? state.message : '';
  });
  protected readonly filteredRows = computed(() =>
    filterRowsBySeries(this.rows(), this.selectedSeries()),
  );
  protected readonly dateRangeLabel = computed(() => {
    const rows = this.filteredRows();

    if (!rows.length) {
      return 'Sin datos';
    }

    const first = rows[0];
    const last = rows[rows.length - 1];

    return `${first.fechaSeguimientoLabel} al ${last.fechaSeguimientoLabel}`;
  });
  protected readonly kpiCards = computed<KpiCard[]>(() => {
    const rows = this.rows();

    if (!rows.length) {
      return [];
    }

    const totalGuiasMayorA2Dias = rows.reduce((sum, row) => sum + row.totalGuiasMayorA2Dias, 0);
    const totalEntre7y15 = rows.reduce((sum, row) => sum + row.totalEntre7y15, 0);
    const totalEntre15y20 = rows.reduce((sum, row) => sum + row.totalEntre15y20, 0);
    const totalMayorA20 = rows.reduce((sum, row) => sum + row.totalMayorA20, 0);
    const promedioPeriodo =
      rows.reduce((sum, row) => sum + row.promedio, 0) / rows.length;

    return [
      {
        label: 'Guía gen/pendi > 2 días',
        value: this.formatInteger(totalGuiasMayorA2Dias),
        caption: 'Sumatoria acumulada del período analizado.',
        toneClass: 'bg-brand-100 text-brand-800',
        badgeLabel: 'Acumulado',
      },
      {
        label: '7 a 15 días',
        value: this.formatInteger(totalEntre7y15),
        caption: 'Sumatoria acumulada dentro del rango intermedio inicial.',
        toneClass: 'bg-ink-100 text-ink-700',
        badgeLabel: 'Acumulado',
      },
      {
        label: '15 a 20 días',
        value: this.formatInteger(totalEntre15y20),
        caption: 'Sumatoria acumulada cercana al umbral de mayor antigüedad.',
        toneClass: 'bg-mint-100 text-mint-800',
        badgeLabel: 'Acumulado',
      },
      {
        label: 'Más de 20 días',
        value: this.formatInteger(totalMayorA20),
        caption: 'Sumatoria acumulada con mayor antigüedad.',
        toneClass: 'bg-gold-100 text-gold-800',
        badgeLabel: 'Acumulado',
      },
      {
        label: 'Promedio',
        value: this.formatDecimal(promedioPeriodo),
        caption: 'Promedio consolidado del período analizado.',
        toneClass: 'bg-mint-100 text-mint-800',
        badgeLabel: 'Periodo',
      },
    ];
  });

  protected reload(): void {
    this.reload$.next();
  }

  protected formatInteger(value: number): string {
    return INTEGER_FORMATTER.format(value);
  }

  protected formatDecimal(value: number): string {
    return DECIMAL_FORMATTER.format(value);
  }
}
