import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NovedadCategorySummaryItem } from '../data-access/novedades-category-summary.models';

const INTEGER_FORMATTER = new Intl.NumberFormat('es-CO');

@Component({
  selector: 'ps-novedades-category-bar-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-[1.5rem] border border-ink-100 bg-gradient-to-b from-ink-50/70 to-white p-4 sm:p-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">
            {{ eyebrow() }}
          </p>
          <h4 class="mt-2 text-lg font-bold tracking-[-0.03em] text-ink-950">
            {{ title() }}
          </h4>
          @if (description()) {
            <p class="mt-2 text-sm text-ink-600">{{ description() }}</p>
          }
        </div>

        <div class="rounded-full px-3 py-1 text-xs font-semibold" [style.backgroundColor]="chipBackground()" [style.color]="chipColor()">
          {{ items().length }} categorías
        </div>
      </div>

      @if (items().length) {
        <div class="mt-6 space-y-4">
          @for (item of chartItems(); track item.nombre) {
            <div class="grid gap-2">
              <div class="flex items-center justify-between gap-3 text-sm">
                <p class="min-w-0 truncate font-semibold text-ink-900">{{ item.nombre }}</p>
                <p class="shrink-0 font-semibold tabular-nums text-ink-700">
                  {{ formatInteger(item.total) }}
                </p>
              </div>

              <div class="h-3 overflow-hidden rounded-full bg-ink-100">
                <div
                  class="h-full rounded-full transition-[width] duration-300"
                  [style.width.%]="item.percentage"
                  [style.background]="barBackground()"
                ></div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="mt-6 rounded-[1.2rem] border border-dashed border-ink-200 bg-white px-4 py-8 text-center text-sm text-ink-500">
          No hay categorías con datos para este reporte.
        </div>
      }
    </div>
  `,
})
export class NovedadesCategoryBarChartComponent {
  readonly eyebrow = input('Distribución');
  readonly title = input.required<string>();
  readonly description = input('');
  readonly accentColor = input('#155ac0');
  readonly accentSoftColor = input('#d8eaff');
  readonly items = input.required<NovedadCategorySummaryItem[]>();

  protected readonly chartItems = computed(() => {
    const items = this.items();
    const max = Math.max(...items.map((item) => item.total), 1);

    return items.map((item) => ({
      ...item,
      percentage: (item.total / max) * 100,
    }));
  });

  protected chipBackground(): string {
    return this.accentSoftColor();
  }

  protected chipColor(): string {
    return this.accentColor();
  }

  protected barBackground(): string {
    return `linear-gradient(90deg, ${this.accentColor()} 0%, ${this.accentColor()}CC 100%)`;
  }

  protected formatInteger(value: number): string {
    return INTEGER_FORMATTER.format(value);
  }
}
