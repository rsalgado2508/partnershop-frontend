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
  precioCantidad: number | null;
  precioFlete: number | null;
  ganancia: number | null;
  fechaReporte: string | null;
  fechaCreacion: string | null;
  numeroGuia: string | null;
  transportadoraNombre: string | null;
  cliente: OrderCustomer | null;
  ciudad: OrderCity | null;
  transportadora: OrderCarrier | null;
  novedadCategoriaNombre: string | null;
  novedad: OrderNovedad | null;
  detalles: OrderDetail[];
}

export interface OrderStatusView {
  code: string;
  label: string;
  tone: 'brand' | 'mint' | 'gold' | 'neutral';
}

export interface OrderCustomer {
  idCliente: number;
  nombreOficial: string | null;
  telefono: string | null;
  email: string | null;
  tipoIdentificacion: string | null;
  numeroIdentificacion: string | null;
}

export interface OrderCity {
  idCiudad: number;
  nombreCiudad: string | null;
  departamento: string | null;
}

export interface OrderCarrier {
  idTransportadora: number;
  nombre: string | null;
}

export interface OrderNovedad {
  idNovedad: number;
  idOrden: number;
  idCategoria: number;
  descripcion: string | null;
  estado: string;
  usuarioRegistro: string | null;
  fechaRegistro: string;
  fechaActualizacion: string;
  categoria: OrderNovedadCategory | null;
}

export interface OrderNovedadCategory {
  idCategoria: number;
  nombre: string | null;
  descripcion: string | null;
  activo: boolean;
  fechaCreacion: string;
}

export interface OrderDetail {
  idDetalle: number;
  idOrden: number;
  idProducto: number;
  cantidad: number;
  producto: OrderProduct | null;
}

export interface OrderProduct {
  idProducto: number;
  nombreOficial: string | null;
}
