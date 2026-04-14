import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
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

const INTEGER_FORMATTER = new Intl.NumberFormat('es-CO');

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
            Guías generadas o pendientes con más de 2 días
          </h4>
        </div>

        <div class="flex flex-wrap items-center gap-4 text-xs font-semibold text-ink-500">
          <span class="inline-flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full bg-brand-600"></span>
            Serie diaria
          </span>

          @if (rows().length > 1) {
            <span class="inline-flex items-center gap-2">
              <span class="h-0.5 w-6 border-t-2 border-dashed border-mint-500"></span>
              Tendencia
            </span>
          }
        </div>
      </div>

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
              Tendencia de guías generadas o pendientes con más de 2 días
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
                stroke="url(#dailyFollowLine)"
                stroke-width="4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            }

            @if (trendPath()) {
              <path
                [attr.d]="trendPath()"
                stroke="#14957a"
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
                  stroke="#155ac0"
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
              <linearGradient id="dailyFollowLine" x1="56" x2="724" y1="0" y2="0">
                <stop offset="0%" stop-color="#155ac0" />
                <stop offset="100%" stop-color="#3aba9c" />
              </linearGradient>

              <linearGradient id="dailyFollowArea" x1="0" x2="0" y1="32" y2="228">
                <stop offset="0%" stop-color="#256fdf" stop-opacity="0.22" />
                <stop offset="100%" stop-color="#256fdf" stop-opacity="0.02" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  `,
})
export class DailyFollowUpChartComponent {
  readonly rows = input.required<DailyFollowUpRow[]>();

  private readonly width = 760;
  private readonly height = 280;
  private readonly leftPadding = 56;
  private readonly rightPadding = 36;
  private readonly topPadding = 22;
  private readonly bottomPadding = 52;

  protected readonly points = computed<ChartPoint[]>(() => {
    const rows = this.rows();

    if (!rows.length) {
      return [];
    }

    const maxValue = Math.max(...rows.map((row) => row.totalGuiasMayorA2Dias), 1);
    const chartWidth = this.width - this.leftPadding - this.rightPadding;
    const chartHeight = this.height - this.topPadding - this.bottomPadding;
    const stepX = rows.length === 1 ? 0 : chartWidth / (rows.length - 1);

    return rows.map((row, index) => {
      const x = rows.length === 1 ? this.leftPadding + chartWidth / 2 : this.leftPadding + stepX * index;
      const ratio = row.totalGuiasMayorA2Dias / maxValue;
      const y = this.topPadding + chartHeight - ratio * chartHeight;

      return {
        x,
        y,
        value: row.totalGuiasMayorA2Dias,
        label: row.fechaSeguimiento,
        fullLabel: `${row.diaSeguimientoLabel} ${row.fechaSeguimientoLabel}`,
      };
    });
  });

  protected readonly yTicks = computed<AxisTick[]>(() => {
    const maxValue = Math.max(...this.rows().map((row) => row.totalGuiasMayorA2Dias), 1);
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
    const maxValue = Math.max(...this.rows().map((row) => row.totalGuiasMayorA2Dias), 1);
    const chartHeight = this.height - this.topPadding - this.bottomPadding;

    const trendPoints = points.map((point, index) => ({
      ...point,
      y: this.topPadding + chartHeight - (trendValues[index] / maxValue) * chartHeight,
    }));

    return this.buildLinePath(trendPoints);
  });

  protected readonly axisLabels = computed(() => {
    const points = this.points();
    const rows = this.rows();

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
