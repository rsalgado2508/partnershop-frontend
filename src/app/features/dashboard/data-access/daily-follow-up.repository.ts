import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '@core/http/api.config';
import { Observable, map } from 'rxjs';
import { mapDailyFollowUpResponse } from './daily-follow-up.mapper';
import { DailyFollowUpQuery, DailyFollowUpRow } from './daily-follow-up.models';

@Injectable({
  providedIn: 'root',
})
export class DailyFollowUpRepository {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  list(query?: Partial<DailyFollowUpQuery>): Observable<DailyFollowUpRow[]> {
    let params = new HttpParams();

    if (query?.fechaDesde) {
      params = params.set('fechaDesde', query.fechaDesde);
    }

    if (query?.fechaHasta) {
      params = params.set('fechaHasta', query.fechaHasta);
    }

    return this.http
      .get<unknown>(`${this.apiBaseUrl}/reportes/seguimiento-diario`, { params })
      .pipe(map(mapDailyFollowUpResponse));
  }
}
