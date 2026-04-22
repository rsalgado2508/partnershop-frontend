import { OrderApiItem, OrdersApiEnvelope } from './orders-api.models';
import { OrderRow, OrdersListResponse, OrderStatusView } from './orders.models';
import { ORDER_STATUS_MAP } from './orders-status.catalog';

function mapStatus(code: string): OrderStatusView {
  return ORDER_STATUS_MAP.get(code) ?? { code, label: code, tone: 'neutral' };
}

function parseAmount(value: number | string | null): number | null {
  if (value === null || value === '') {
    return null;
  }

  const parsed = typeof value === 'number' ? value : Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function mapRow(item: OrderApiItem): OrderRow {
  return {
    idOrden: item.idOrden,
    idOrdenTienda: item.idOrdenTienda,
    clienteNombre: item.cliente?.nombreOficial ?? null,
    ciudadNombre: item.ciudad?.nombreCiudad ?? null,
    plataforma: item.plataforma,
    estatus: mapStatus(item.estatus),
    totalOrden: parseAmount(item.totalOrden),
    precioCantidad: parseAmount(item.precioCantidad),
    precioFlete: parseAmount(item.precioFlete),
    ganancia: parseAmount(item.ganancia),
    fechaReporte: item.fechaReporte,
    fechaCreacion: item.fechaCreacion,
    numeroGuia: item.numeroGuia,
    transportadoraNombre: item.transportadora?.nombre ?? null,
    cliente: item.cliente,
    ciudad: item.ciudad,
    transportadora: item.transportadora,
    novedadCategoriaNombre: item.novedad?.categoria?.nombre ?? null,
    novedad: item.novedad,
    detalles: item.detalles ?? [],
  };
}

export function mapOrdersResponse(response: OrdersApiEnvelope): OrdersListResponse {
  return {
    rows: response.data.data.map(mapRow),
    total: response.data.total,
    page: response.data.page,
    limit: response.data.limit,
    totalPages: response.data.totalPages,
  };
}
