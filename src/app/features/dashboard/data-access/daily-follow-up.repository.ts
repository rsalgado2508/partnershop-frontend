import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '@core/http/api.config';
import { Observable, map } from 'rxjs';
import { mapDailyFollowUpResponse } from './daily-follow-up.mapper';
import { DailyFollowUpRow } from './daily-follow-up.models';

@Injectable({
  providedIn: 'root',
})
export class DailyFollowUpRepository {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  list(): Observable<DailyFollowUpRow[]> {
    return this.http
      .get<unknown>(`${this.apiBaseUrl}/reportes/seguimiento-diario`)
      .pipe(map(mapDailyFollowUpResponse));
  }
}
