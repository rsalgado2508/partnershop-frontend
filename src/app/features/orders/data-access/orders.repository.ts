import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '@core/http/api.config';
import { Observable, map } from 'rxjs';
import { OrdersApiEnvelope } from './orders-api.models';
import { mapOrdersResponse } from './orders.mapper';
import { OrdersListQuery, OrdersListResponse } from './orders.models';

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

    return this.http
      .get<OrdersApiEnvelope>(`${this.apiBaseUrl}/ordenes`, { params })
      .pipe(map(mapOrdersResponse));
  }
}
