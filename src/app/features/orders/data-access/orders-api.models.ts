export interface OrdersApiEnvelope {
  statusCode: number;
  data: OrdersApiPayload;
  timestamp: string;
}

export interface OrdersApiPayload {
  data: OrderApiItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrderApiItem {
  idOrden: number;
  idCliente: number;
  idCiudad: number;
  idTransportadora: number | null;
  estatus: string;
  fechaReporte: string | null;
  totalOrden: number | null;
  precioCantidad: number | null;
  precioFlete: number | null;
  ganancia: number | null;
  numeroGuia: string | null;
  plataforma: string | null;
  responsableVenta: string | null;
  idOrdenTienda: string | null;
  referenciaMovimiento: string | null;
  fechaCreacion: string;
  cliente: {
    idCliente: number;
    nombreOficial: string | null;
    telefono: string | null;
    email: string | null;
    tipoIdentificacion: string | null;
    numeroIdentificacion: string | null;
  } | null;
  ciudad: {
    idCiudad: number;
    nombreCiudad: string | null;
    departamento: string | null;
  } | null;
  transportadora: {
    idTransportadora: number;
    nombre: string | null;
  } | null;
  novedad: OrderNovedadApiItem | null;
  detalles: OrderDetailApiItem[];
}

export interface OrderNovedadApiItem {
  idNovedad: number;
  idOrden: number;
  idCategoria: number;
  descripcion: string | null;
  estado: string;
  usuarioRegistro: string | null;
  fechaRegistro: string;
  fechaActualizacion: string;
  categoria: OrderNovedadCategoryApiItem | null;
  historial: unknown[];
}

export interface OrderNovedadCategoryApiItem {
  idCategoria: number;
  nombre: string | null;
  descripcion: string | null;
  activo: boolean;
  fechaCreacion: string;
  novedades: unknown[];
}

export interface OrderDetailApiItem {
  idDetalle: number;
  idOrden: number;
  idProducto: number;
  cantidad: number;
  producto: {
    idProducto: number;
    nombreOficial: string | null;
  } | null;
}
