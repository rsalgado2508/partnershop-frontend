export interface CategoriaNovedad {
  idCategoria: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  fechaCreacion: string;
}

export interface CategoriasNovedadResponse {
  statusCode: number;
  data: CategoriaNovedad[];
  timestamp: string;
}

export interface CreateNovedadRequest {
  idOrden: number;
  idCategoria: number;
  descripcion: string;
}

export interface CreateNovedadResponse {
  statusCode: number;
  data: unknown;
  timestamp: string;
}

export interface Novedad {
  idNovedad: number;
  idOrden: number;
  idCategoria: number;
  categoriaNombre: string;
  descripcion: string;
  estado: string;
  usuarioRegistro: string | null;
  fechaRegistro: string;
  fechaActualizacion: string;
}

export interface NovedadHistorialItem {
  idHistorial: number;
  idNovedad: number;
  accion: string;
  estadoAnterior: string | null;
  estadoNuevo: string | null;
  detalle: string;
  usuario: string | null;
  fecha: string;
}

export interface HistorialNovedadesResponse {
  statusCode: number;
  data: Novedad[];
  timestamp: string;
}
