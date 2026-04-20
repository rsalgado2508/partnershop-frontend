import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DailyFollowUpRow } from '../data-access/daily-follow-up.models';

interface ChartPoint {
  x: number;
  y: number;
  value: number;
  label: string;
  fullLabel: string;
}

interface AxisTick {
  value: number;
  y: number;
}

export type ChartSeriesKey = 'guiasMayorA2Dias' | 'entre7y15' | 'entre15y20' | 'mayorA20';

interface ChartSeriesOption {
  key: ChartSeriesKey;
  label: string;
  title: string;
  description: string;
  valueAccessor: (row: DailyFollowUpRow) => number;
  accentColor: string;
  accentDarkColor: string;
  accentSoftColor: string;
  areaOpacity: number;
}

const INTEGER_FORMATTER = new Intl.NumberFormat('es-CO');
const CHART_SERIES: ChartSeriesOption[] = [
  {
    key: 'guiasMayorA2Dias',
    label: 'Guía gen/pendi > 2 días',
    title: 'Guías generadas o pendientes con más de 2 días',
    description: 'Serie principal del seguimiento operativo crítico.',
    valueAccessor: (row) => row.totalGuiasMayorA2Dias,
    accentColor: '#0f9f68',
    accentDarkColor: '#0c7a50',
    accentSoftColor: '#d2f4ea',
    areaOpacity: 0.24,
  },
  {
    key: 'entre7y15',
    label: '7 a 15 días',
    title: 'Órdenes en seguimiento de 7 a 15 días',
    description: 'Backlog del rango intermedio inicial.',
    valueAccessor: (row) => row.totalEntre7y15,
    accentColor: '#8b5cf6',
    accentDarkColor: '#6d28d9',
    accentSoftColor: '#ede9fe',
    areaOpacity: 0.22,
  },
  {
    key: 'entre15y20',
    label: '15 a 20 días',
    title: 'Órdenes en seguimiento de 15 a 20 días',
    description: 'Backlog cercano al umbral de mayor antigüedad.',
    valueAccessor: (row) => row.totalEntre15y20,
    accentColor: '#ea9b19',
    accentDarkColor: '#b96a00',
    accentSoftColor: '#fff0c9',
    areaOpacity: 0.24,
  },
  {
    key: 'mayorA20',
    label: 'Más de 20 días',
    title: 'Órdenes en seguimiento de más de 20 días',
    description: 'Backlog con la mayor antigüedad acumulada.',
    valueAccessor: (row) => row.totalMayorA20,
    accentColor: '#d94f63',
    accentDarkColor: '#b9384f',
    accentSoftColor: '#ffe1e7',
    areaOpacity: 0.24,
  },
];

function getSeriesOption(key: ChartSeriesKey): ChartSeriesOption {
  return CHART_SERIES.find((series) => series.key === key) ?? CHART_SERIES[0];
}

export function filterRowsBySeries(
  rows: DailyFollowUpRow[],
  seriesKey: ChartSeriesKey,
): DailyFollowUpRow[] {
  const { valueAccessor } = getSeriesOption(seriesKey);

  return rows.filter((row) => valueAccessor(row) > 0);
}

@Component({
  selector: 'ps-daily-follow-up-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-[1.5rem] border border-ink-100 bg-gradient-to-b from-ink-50/80 to-white p-4 sm:p-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">
            Tendencia principal
          </p>
          <h4 class="mt-2 text-lg font-bold tracking-[-0.03em] text-ink-950">
            {{ activeSeries().title }}
          </h4>
          <p class="mt-2 text-sm text-ink-600">{{ activeSeries().description }}</p>
        </div>

        <div class="flex flex-wrap items-center gap-4 text-xs font-semibold text-ink-500">
          <span class="inline-flex items-center gap-2">
            <span
              class="h-2.5 w-2.5 rounded-full"
              [style.backgroundColor]="activeSeries().accentColor"
            ></span>
            Serie diaria
          </span>

          @if (activeRows().length > 1) {
            <span class="inline-flex items-center gap-2">
              <span
                class="h-0.5 w-6 border-t-2 border-dashed"
                [style.borderTopColor]="activeSeries().accentDarkColor"
              ></span>
              Tendencia
            </span>
          }
        </div>
      </div>

      <div class="mt-5 flex flex-wrap gap-2">
        @for (series of seriesOptions; track series.key) {
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200"
            [class.border-ink-200]="selectedSeries() !== series.key"
            [class.bg-white]="selectedSeries() !== series.key"
            [class.text-ink-700]="selectedSeries() !== series.key"
            [class.hover:border-brand-200]="selectedSeries() !== series.key"
            [class.hover:text-brand-800]="selectedSeries() !== series.key"
            [style.borderColor]="selectedSeries() === series.key ? series.accentColor : null"
            [style.backgroundColor]="selectedSeries() === series.key ? series.accentSoftColor : null"
            [style.color]="selectedSeries() === series.key ? series.accentDarkColor : null"
            (click)="selectSeries(series.key)"
          >
            <span
              class="h-2.5 w-2.5 rounded-full"
              [style.backgroundColor]="series.accentColor"
            ></span>
            {{ series.label }}
          </button>
        }
      </div>

      @if (activeRows().length) {
        <div class="mt-6 overflow-x-auto">
          <div class="min-w-[680px]">
            <svg
              class="w-full"
              viewBox="0 0 760 280"
              fill="none"
              aria-labelledby="daily-follow-up-chart-title"
              role="img"
            >
              <title id="daily-follow-up-chart-title">
                Tendencia de {{ activeSeries().title.toLowerCase() }}
              </title>

              @for (tick of yTicks(); track tick.value) {
                <g>
                  <line
                    x1="56"
                    x2="724"
                    [attr.y1]="tick.y"
                    [attr.y2]="tick.y"
                    stroke="rgba(175, 189, 209, 0.35)"
                    stroke-dasharray="4 8"
                  />
                  <text
                    x="44"
                    [attr.y]="tick.y + 4"
                    text-anchor="end"
                    class="fill-ink-400 text-[11px] font-medium"
                  >
                    {{ formatInteger(tick.value) }}
                  </text>
                </g>
              }

              @if (areaPath()) {
                <path [attr.d]="areaPath()" fill="url(#dailyFollowArea)" opacity="0.9" />
              }

              @if (linePath()) {
                <path
                  [attr.d]="linePath()"
                  [attr.stroke]="activeSeries().accentColor"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              }

              @if (trendPath()) {
                <path
                  [attr.d]="trendPath()"
                  [attr.stroke]="activeSeries().accentDarkColor"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-dasharray="8 7"
                  opacity="0.9"
                />
              }

              @for (point of points(); track point.label) {
                <g>
                  <circle
                    [attr.cx]="point.x"
                    [attr.cy]="point.y"
                    r="6"
                    fill="#ffffff"
                    [attr.stroke]="activeSeries().accentColor"
                    stroke-width="3"
                  >
                    <title>{{ point.fullLabel }}: {{ formatInteger(point.value) }}</title>
                  </circle>
                </g>
              }

              @for (label of axisLabels(); track label.label) {
                <text
                  [attr.x]="label.x"
                  y="264"
                  text-anchor="middle"
                  class="fill-ink-500 text-[11px] font-medium"
                >
                  {{ label.label }}
                </text>
              }

              <defs>
                <linearGradient id="dailyFollowArea" x1="0" x2="0" y1="32" y2="228">
                  <stop
                    offset="0%"
                    [attr.stop-color]="activeSeries().accentColor"
                    [attr.stop-opacity]="activeSeries().areaOpacity"
                  />
                  <stop
                    offset="100%"
                    [attr.stop-color]="activeSeries().accentColor"
                    stop-opacity="0.02"
                  />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      } @else {
        <div class="mt-6 rounded-[1.2rem] border border-dashed border-ink-200 bg-white px-4 py-8 text-center text-sm text-ink-500">
          No hay datos con valores mayores a cero para este rango.
        </div>
      }
    </div>
  `,
})
export class DailyFollowUpChartComponent {
  readonly rows = input.required<DailyFollowUpRow[]>();
  readonly selectedSeries = input<ChartSeriesKey>('guiasMayorA2Dias');
  readonly selectedSeriesChange = output<ChartSeriesKey>();
  protected readonly seriesOptions = CHART_SERIES;

  private readonly width = 760;
  private readonly height = 280;
  private readonly leftPadding = 56;
  private readonly rightPadding = 36;
  private readonly topPadding = 22;
  private readonly bottomPadding = 52;

  protected readonly activeSeries = computed(
    () => getSeriesOption(this.selectedSeries()),
  );
  protected readonly activeRows = computed(() =>
    filterRowsBySeries(this.rows(), this.selectedSeries()),
  );
  private readonly activeValues = computed(() =>
    this.activeRows().map((row) => this.activeSeries().valueAccessor(row)),
  );
  private readonly maxValue = computed(() => Math.max(...this.activeValues(), 1));

  protected readonly points = computed<ChartPoint[]>(() => {
    const rows = this.activeRows();

    if (!rows.length) {
      return [];
    }

    const values = this.activeValues();
    const maxValue = this.maxValue();
    const chartWidth = this.width - this.leftPadding - this.rightPadding;
    const chartHeight = this.height - this.topPadding - this.bottomPadding;
    const stepX = rows.length === 1 ? 0 : chartWidth / (rows.length - 1);

    return rows.map((row, index) => {
      const x = rows.length === 1 ? this.leftPadding + chartWidth / 2 : this.leftPadding + stepX * index;
      const ratio = values[index] / maxValue;
      const y = this.topPadding + chartHeight - ratio * chartHeight;

      return {
        x,
        y,
        value: values[index],
        label: row.fechaSeguimiento,
        fullLabel: `${row.diaSeguimientoLabel} ${row.fechaSeguimientoLabel}`,
      };
    });
  });

  protected readonly yTicks = computed<AxisTick[]>(() => {
    const maxValue = this.maxValue();
    const chartHeight = this.height - this.topPadding - this.bottomPadding;

    return [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
      value: Math.round(maxValue * (1 - ratio)),
      y: this.topPadding + chartHeight * ratio,
    }));
  });

  protected readonly linePath = computed(() => this.buildLinePath(this.points()));

  protected readonly areaPath = computed(() => {
    const points = this.points();

    if (!points.length) {
      return '';
    }

    const baseline = this.height - this.bottomPadding;
    return `${this.buildLinePath(points)} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`;
  });

  protected readonly trendPath = computed(() => {
    const points = this.points();

    if (points.length < 2) {
      return '';
    }

    const trendValues = this.buildTrendValues(points.map((point) => point.value));
    const maxValue = this.maxValue();
    const chartHeight = this.height - this.topPadding - this.bottomPadding;

    const trendPoints = points.map((point, index) => ({
      ...point,
      y: this.topPadding + chartHeight - (trendValues[index] / maxValue) * chartHeight,
    }));

    return this.buildLinePath(trendPoints);
  });

  protected readonly axisLabels = computed(() => {
    const points = this.points();
    const rows = this.activeRows();

    if (!points.length) {
      return [];
    }

    const maxLabels = 6;
    const step = Math.max(1, Math.ceil(points.length / maxLabels));
    const visibleIndexes = new Set<number>();

    for (let index = 0; index < points.length; index += step) {
      visibleIndexes.add(index);
    }

    visibleIndexes.add(0);
    visibleIndexes.add(points.length - 1);

    return [...visibleIndexes]
      .sort((left, right) => left - right)
      .map((index) => ({
        x: points[index].x,
        label: rows[index].fechaSeguimientoShortLabel,
      }));
  });

  protected formatInteger(value: number): string {
    return INTEGER_FORMATTER.format(value);
  }

  protected selectSeries(key: ChartSeriesKey): void {
    this.selectedSeriesChange.emit(key);
  }

  private buildLinePath(points: Array<Pick<ChartPoint, 'x' | 'y'>>): string {
    if (!points.length) {
      return '';
    }

    return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  }

  private buildTrendValues(values: number[]): number[] {
    const total = values.length;
    const xMean = (total - 1) / 2;
    const yMean = values.reduce((sum, value) => sum + value, 0) / total;

    let numerator = 0;
    let denominator = 0;

    values.forEach((value, index) => {
      numerator += (index - xMean) * (value - yMean);
      denominator += (index - xMean) ** 2;
    });

    const slope = denominator === 0 ? 0 : numerator / denominator;
    const intercept = yMean - slope * xMean;

    return values.map((_, index) => Math.max(intercept + slope * index, 0));
  }
}
