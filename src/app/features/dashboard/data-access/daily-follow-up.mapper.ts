import { DailyFollowUpApiItem, DailyFollowUpRow } from './daily-follow-up.models';

const LONG_DATE_FORMATTER = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractItems(response: unknown): DailyFollowUpApiItem[] {
  if (Array.isArray(response)) {
    return response as DailyFollowUpApiItem[];
  }

  if (isRecord(response) && Array.isArray(response['data'])) {
    return response['data'] as DailyFollowUpApiItem[];
  }

  if (
    isRecord(response) &&
    isRecord(response['data']) &&
    Array.isArray((response['data'] as Record<string, unknown>)['data'])
  ) {
    return (response['data'] as Record<string, unknown>)['data'] as DailyFollowUpApiItem[];
  }

  return [];
}

function parseDateOnly(value: unknown): Date | null {
  if (typeof value !== 'string') {
    return null;
  }

  const [year, month, day] = value.split('-').map((part) => Number(part));

  if (!year || !month || !day) {
    return null;
  }

  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function normalizeDayLabel(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) {
    return 'Sin día';
  }

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function buildDateLabel(rawValue: unknown, date: Date | null): string {
  if (!date) {
    return typeof rawValue === 'string' && rawValue.trim() ? rawValue : 'Sin fecha';
  }

  return LONG_DATE_FORMATTER.format(date);
}

function buildShortDateLabel(rawValue: unknown, date: Date | null, dayLabel: string): string {
  if (!date) {
    return typeof rawValue === 'string' && rawValue.trim() ? rawValue : 'Sin fecha';
  }

  const shortDay = dayLabel.slice(0, 3).toLowerCase();
  return `${shortDay} ${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
}

function toNumber(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mapDailyFollowUpResponse(response: unknown): DailyFollowUpRow[] {
  return extractItems(response)
    .sort((left, right) => left.fechaSeguimiento.localeCompare(right.fechaSeguimiento))
    .map((item) => {
      const date = parseDateOnly(item.fechaSeguimiento);
      const dayLabel = normalizeDayLabel(item.diaSeguimiento);

      return {
        fechaSeguimiento: typeof item.fechaSeguimiento === 'string' ? item.fechaSeguimiento : '',
        fechaSeguimientoDate: date ?? new Date(0),
        fechaSeguimientoLabel: buildDateLabel(item.fechaSeguimiento, date),
        fechaSeguimientoShortLabel: buildShortDateLabel(item.fechaSeguimiento, date, dayLabel),
        diaSeguimiento: typeof item.diaSeguimiento === 'string' ? item.diaSeguimiento : '',
        diaSeguimientoLabel: dayLabel,
        totalEntre15y20: toNumber(item.totalEntre15y20),
        totalEntre7y15: toNumber(item.totalEntre7y15),
        totalGuiasMayorA2Dias: toNumber(item.totalGuiasMayorA2Dias),
        totalMayorA20: toNumber(item.totalMayorA20),
        promedio: toNumber(item.sumaTotal),
        totalAcumulado: toNumber(item.totalAcumulado),
      };
    });
}
