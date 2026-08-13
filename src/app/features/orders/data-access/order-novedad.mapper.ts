import {
  CategoriaNovedadApiItem,
  CategoriasNovedadApiResponse,
  CreateNovedadApiResponse,
  NovedadApiItem,
  NovedadesByOrderApiResponse,
} from './order-novedad-api.models';
import {
  CategoriaNovedad,
  CategoriasNovedadResponse,
  CreateNovedadResponse,
  HistorialNovedadesResponse,
  Novedad,
} from './order-novedad.models';

function mapCategoriaNovedad(item: CategoriaNovedadApiItem): CategoriaNovedad {
  return {
    idCategoria: item.idCategoria,
    nombre: item.nombre,
    descripcion: item.descripcion,
    activo: item.activo,
    fechaCreacion: item.fechaCreacion,
  };
}

export function mapCategoriasNovedadResponse(
  response: CategoriasNovedadApiResponse,
): CategoriasNovedadResponse {
  return {
    statusCode: response.statusCode,
    data: response.data.map(mapCategoriaNovedad),
    timestamp: response.timestamp,
  };
}

export function mapCreateNovedadResponse(
  response: CreateNovedadApiResponse,
): CreateNovedadResponse {
  return {
    statusCode: response.statusCode,
    data: response.data,
    timestamp: response.timestamp,
  };
}

function mapNovedad(item: NovedadApiItem): Novedad {
  return {
    idNovedad: item.idNovedad,
    idOrden: item.idOrden,
    idCategoria: item.idCategoria,
    categoriaNombre: item.categoria?.nombre?.trim() || `Categoría ${item.idCategoria}`,
    descripcion: item.descripcion,
    estado: item.estado,
    usuarioRegistro: item.usuarioRegistro,
    fechaRegistro: item.fechaRegistro,
    fechaActualizacion: item.fechaActualizacion,
  };
}

export function mapNovedadesByOrderResponse(
  response: NovedadesByOrderApiResponse,
): HistorialNovedadesResponse {
  return {
    statusCode: response.statusCode,
    data: response.data.map(mapNovedad),
    timestamp: response.timestamp,
  };
}
