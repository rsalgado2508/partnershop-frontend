export interface OrdersListQuery {
  page: number;
  limit: number;
  estatus: string;
  busqueda: string;
  plataforma: string;
  rangoFechaReporte: string;
}

export interface OrdersListResponse {
  rows: OrderRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrderRow {
  idOrden: number;
  idOrdenTienda: string | null;
  clienteNombre: string | null;
  ciudadNombre: string | null;
  plataforma: string | null;
  estatus: OrderStatusView;
  totalOrden: number | null;
  fechaReporte: string | null;
  fechaCreacion: string | null;
  numeroGuia: string | null;
  transportadoraNombre: string | null;
}

export interface OrderStatusView {
  code: number;
  label: string;
  tone: 'brand' | 'mint' | 'gold' | 'neutral';
}
