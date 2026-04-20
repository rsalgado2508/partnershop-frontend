import { NovedadCategorySummaryItem } from './novedades-category-summary.models';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractItems(response: unknown): unknown[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (isRecord(response) && Array.isArray(response['data'])) {
    return response['data'] as unknown[];
  }

  if (
    isRecord(response) &&
    isRecord(response['data']) &&
    Array.isArray((response['data'] as Record<string, unknown>)['data'])
  ) {
    return (response['data'] as Record<string, unknown>)['data'] as unknown[];
  }

  return [];
}

function toNumber(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mapNovedadCategorySummaryItems(response: unknown): NovedadCategorySummaryItem[] {
  return extractItems(response)
    .filter(isRecord)
    .map((item) => ({
      nombre: typeof item['nombre'] === 'string' && item['nombre'].trim() ? item['nombre'] : 'Sin categoría',
      total: toNumber(item['total']),
    }))
    .sort((left, right) => right.total - left.total);
}
