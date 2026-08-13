export interface CategoriaNovedadApiItem {
  idCategoria: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  fechaCreacion: string;
}

export interface CategoriasNovedadApiResponse {
  statusCode: number;
  data: CategoriaNovedadApiItem[];
  timestamp: string;
}

export interface CreateNovedadApiRequest {
  idOrden: number;
  idCategoria: number;
  descripcion: string;
}

export interface CreateNovedadApiResponse {
  statusCode: number;
  data: unknown;
  timestamp: string;
}

export interface NovedadApiItem {
  idNovedad: number;
  idOrden: number;
  idCategoria: number;
  descripcion: string;
  estado: string;
  usuarioRegistro: string | null;
  fechaRegistro: string;
  fechaActualizacion: string;
  categoria: {
    idCategoria: number;
    nombre: string;
    descripcion: string | null;
    activo: boolean;
    fechaCreacion: string;
  } | null;
  historial: NovedadHistorialApiItem[];
}

export interface NovedadHistorialApiItem {
  idHistorial: number;
  idNovedad: number;
  accion: string;
  estadoAnterior: string | null;
  estadoNuevo: string | null;
  detalle: string;
  usuario: string | null;
  fecha: string;
}

export interface NovedadesByOrderApiResponse {
  statusCode: number;
  data: NovedadApiItem[];
  timestamp: string;
}
