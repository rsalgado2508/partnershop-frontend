import { OrderApiItem, OrdersApiEnvelope } from './orders-api.models';
import { OrderRow, OrdersListResponse, OrderStatusView } from './orders.models';

function mapStatus(code: number): OrderStatusView {
  switch (code) {
    case 22:
      return { code, label: 'Reportada', tone: 'brand' };
    case 23:
      return { code, label: 'Confirmada', tone: 'gold' };
    case 24:
      return { code, label: 'En preparación', tone: 'gold' };
    case 25:
      return { code, label: 'Despachada', tone: 'mint' };
    case 26:
      return { code, label: 'Entregada', tone: 'mint' };
    case 27:
      return { code, label: 'Novedad', tone: 'neutral' };
    case 28:
      return { code, label: 'Cancelada', tone: 'neutral' };
    default:
      return { code, label: `Estatus ${code}`, tone: 'neutral' };
  }
}

function parseAmount(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseFloat(value);
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
    fechaReporte: item.fechaReporte,
    fechaCreacion: item.fechaCreacion,
    numeroGuia: item.numeroGuia,
    transportadoraNombre: item.transportadora?.nombre ?? null,
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
