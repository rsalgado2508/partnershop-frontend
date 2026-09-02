import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '@core/http/api.config';
import { Observable, map } from 'rxjs';
import {
  OrdersApiEnvelope,
  PlataformasApiEnvelope,
  TransportadorasApiEnvelope,
} from './orders-api.models';
import { mapOrdersResponse } from './orders.mapper';
import { OrdersListQuery, OrdersListResponse, TransportadoraOption } from './orders.models';

@Injectable({
  providedIn: 'root',
})
export class OrdersRepository {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  private isValidDate(dateString: string | null | undefined): boolean {
    if (!dateString || typeof dateString !== 'string') return false;
    // Debe ser YYYY-MM-DD
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  private normalizeDateFormat(dateString: string | null | undefined): string | null {
    if (!dateString || typeof dateString !== 'string' || dateString.trim() === '') {
      return null;
    }

    dateString = dateString.trim();

    // Si ya está en formato YYYY-MM-DD, retornarlo
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // Intentar múltiples formatos
    try {
      // Formato MM/DD/YYYY
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
        const [month, day, year] = dateString.split('/');
        const normalized = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        const date = new Date(normalized);
        if (!isNaN(date.getTime())) {
          return normalized;
        }
      }

      // Formato YYYY/MM/DD
      if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('/');
        const normalized = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        const date = new Date(normalized);
        if (!isNaN(date.getTime())) {
          return normalized;
        }
      }

      // Formato ISO (2026-04-07T00:00:00.000Z)
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (error) {
      console.warn('Error normalizando fecha:', dateString, error);
    }

    return null;
  }

  list(query: OrdersListQuery): Observable<OrdersListResponse> {
    let params = new HttpParams()
      .set('page', query.page)
      .set('limit', query.limit)
      .set('ordenarPor', query.ordenarPor)
      .set('direccion', query.direccion);

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

    const normalizedDesde = this.normalizeDateFormat(query.fechaReporteDesde);
    if (normalizedDesde) {
      params = params.set('fechaReporteDesde', normalizedDesde);
    }

    const normalizedHasta = this.normalizeDateFormat(query.fechaReporteHasta);
    if (normalizedHasta) {
      params = params.set('fechaReporteHasta', normalizedHasta);
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

  listPlataformas(): Observable<string[]> {
    return this.http
      .get<PlataformasApiEnvelope>(`${this.apiBaseUrl}/ordenes/plataformas`)
      .pipe(map((response) => response.data));
  }

  exportCsv(query: OrdersListQuery): Observable<Blob> {
    let params = new HttpParams();

    if (query.estatus && query.estatus.trim()) {
      params = params.set('estatus', query.estatus);
    }

    if (query.busqueda && query.busqueda.trim()) {
      params = params.set('busqueda', query.busqueda);
    }

    if (query.plataforma && query.plataforma.trim()) {
      params = params.set('plataforma', query.plataforma);
    }

    if (query.idCategoriaNovedad && query.idCategoriaNovedad.trim()) {
      const catId = Number(query.idCategoriaNovedad);
      if (!isNaN(catId) && catId > 0) {
        params = params.set('idCategoriaNovedad', String(catId));
      }
    }

    if (query.transportadora && query.transportadora.trim()) {
      params = params.set('transportadora', query.transportadora);
    }

    const normalizedDesde = this.normalizeDateFormat(query.fechaReporteDesde);
    if (normalizedDesde) {
      params = params.set('fechaReporteDesde', normalizedDesde);
    }

    const normalizedHasta = this.normalizeDateFormat(query.fechaReporteHasta);
    if (normalizedHasta) {
      params = params.set('fechaReporteHasta', normalizedHasta);
    }

    if (query.rangoFechaReporte && query.rangoFechaReporte.trim()) {
      params = params.set('rangoFechaReporte', query.rangoFechaReporte);
    }

    return this.http.get(`${this.apiBaseUrl}/ordenes/export-csv`, {
      params,
      responseType: 'blob',
    });
  }
}
