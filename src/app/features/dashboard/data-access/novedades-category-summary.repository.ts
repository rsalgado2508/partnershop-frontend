import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '@core/http/api.config';
import { forkJoin, Observable, map } from 'rxjs';
import { mapNovedadCategorySummaryItems } from './novedades-category-summary.mapper';
import {
  NovedadCategorySummaryItem,
  NovedadesCategorySummary,
} from './novedades-category-summary.models';

@Injectable({
  providedIn: 'root',
})
export class NovedadesCategorySummaryRepository {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  listGuiasMayorA2Dias(): Observable<NovedadCategorySummaryItem[]> {
    return this.http
      .get<unknown>(`${this.apiBaseUrl}/reportes/novedades-guias-mayor-a-2-dias`)
      .pipe(map(mapNovedadCategorySummaryItems));
  }

  listMayorA20Dias(): Observable<NovedadCategorySummaryItem[]> {
    return this.http
      .get<unknown>(`${this.apiBaseUrl}/reportes/novedades-mayor-a-20-dias`)
      .pipe(map(mapNovedadCategorySummaryItems));
  }

  listSummary(): Observable<NovedadesCategorySummary> {
    return forkJoin({
      guiasMayorA2Dias: this.listGuiasMayorA2Dias(),
      mayorA20Dias: this.listMayorA20Dias(),
    });
  }
}
