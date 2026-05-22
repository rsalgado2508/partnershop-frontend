import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '@core/http/api.config';
import { Observable, map } from 'rxjs';
import { OrdersApiEnvelope, TransportadorasApiEnvelope } from './orders-api.models';
import { mapOrdersResponse } from './orders.mapper';
import { OrdersListQuery, OrdersListResponse, TransportadoraOption } from './orders.models';

@Injectable({
  providedIn: 'root',
})
export class OrdersRepository {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  list(query: OrdersListQuery): Observable<OrdersListResponse> {
    let params = new HttpParams()
      .set('page', query.page)
      .set('limit', query.limit);

    if (query.estatus) {
      params = params.set('estatus', query.estatus);
    }

    if (query.busqueda) {
      params = params.set('busqueda', query.busqueda);
    }

    if (query.plataforma) {
      params = params.set('plataforma', query.plataforma);
    }

    if (query.idCategoriaNovedad) {
      params = params.set('idCategoriaNovedad', query.idCategoriaNovedad);
    }

    if (query.transportadora) {
      params = params.set('transportadora', query.transportadora);
    }

    if (query.fechaReporteDesde) {
      params = params.set('fechaReporteDesde', query.fechaReporteDesde);
    }

    if (query.fechaReporteHasta) {
      params = params.set('fechaReporteHasta', query.fechaReporteHasta);
    }

    if (query.rangoFechaReporte) {
      params = params.set('rangoFechaReporte', query.rangoFechaReporte);
    }

    return this.http
      .get<OrdersApiEnvelope>(`${this.apiBaseUrl}/ordenes`, { params })
      .pipe(map(mapOrdersResponse));
  }

  listTransportadoras(): Observable<TransportadoraOption[]> {
    return this.http
      .get<TransportadorasApiEnvelope>(`${this.apiBaseUrl}/ordenes/transportadoras`)
      .pipe(map((response) => response.data));
  }
}
