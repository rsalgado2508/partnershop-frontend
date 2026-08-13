import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '@core/http/api.config';
import { Observable, map } from 'rxjs';
import {
  CategoriasNovedadApiResponse,
  CreateNovedadApiRequest,
  CreateNovedadApiResponse,
  NovedadesByOrderApiResponse,
} from './order-novedad-api.models';
import {
  mapCategoriasNovedadResponse,
  mapCreateNovedadResponse,
  mapNovedadesByOrderResponse,
} from './order-novedad.mapper';
import {
  CategoriasNovedadResponse,
  CreateNovedadRequest,
  CreateNovedadResponse,
  HistorialNovedadesResponse,
} from './order-novedad.models';

@Injectable({
  providedIn: 'root',
})
export class OrderNovedadRepository {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  listCategorias(): Observable<CategoriasNovedadResponse> {
    return this.http
      .get<CategoriasNovedadApiResponse>(`${this.apiBaseUrl}/categorias-novedad`)
      .pipe(map(mapCategoriasNovedadResponse));
  }

  create(payload: CreateNovedadRequest): Observable<CreateNovedadResponse> {
    const body: CreateNovedadApiRequest = {
      idOrden: payload.idOrden,
      idCategoria: payload.idCategoria,
      descripcion: payload.descripcion,
    };

    return this.http
      .post<CreateNovedadApiResponse>(`${this.apiBaseUrl}/novedades`, body)
      .pipe(map(mapCreateNovedadResponse));
  }

  listByOrder(idOrden: number): Observable<HistorialNovedadesResponse> {
    return this.http
      .get<NovedadesByOrderApiResponse>(`${this.apiBaseUrl}/novedades/orden/${idOrden}`)
      .pipe(map(mapNovedadesByOrderResponse));
  }
}
