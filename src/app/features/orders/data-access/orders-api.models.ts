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
  estatus: number;
  fechaReporte: string | null;
  totalOrden: string | null;
  precioCantidad: string | null;
  precioFlete: string | null;
  ganancia: string | null;
  numeroGuia: string | null;
  plataforma: string | null;
  responsableVenta: string | null;
  idOrdenTienda: string | null;
  referenciaMovimiento: string | null;
  fechaCreacion: string;
  cliente: {
    idCliente: number;
    nombreOficial: string | null;
  } | null;
  ciudad: {
    idCiudad: number;
    nombreCiudad: string | null;
  } | null;
  transportadora: {
    idTransportadora: number;
    nombre: string | null;
  } | null;
}
