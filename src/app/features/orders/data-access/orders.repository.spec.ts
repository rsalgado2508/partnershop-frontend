import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '@core/http/api.config';
import { OrdersRepository } from './orders.repository';

describe('OrdersRepository current summary API contract', () => {
  let http: HttpTestingController;
  let repository: OrdersRepository;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(), provideHttpClientTesting(),
      { provide: API_BASE_URL, useValue: '/api' },
    ] });
    http = TestBed.inject(HttpTestingController);
    repository = TestBed.inject(OrdersRepository);
  });
  afterEach(() => http.verify());

  it('unwraps the backend response envelope and preserves valid zero counts', async () => {
    const data = { guiasMayorA2Dias: 122, entre7y15: 399, entre15y20: 0, mayorA20: 65, totalUnico: 571 };
    const result = firstValueFrom(repository.seguimientoActual());
    http.expectOne('/api/ordenes/seguimiento-actual').flush({ statusCode: 200, data, timestamp: '2026-09-16T21:00:00Z' });
    expect(await result).toEqual(data);
  });

  it.each([{}, { data: {} }, { data: { guiasMayorA2Dias: null } }])('rejects incomplete responses instead of showing NaN or fabricated zeros', async payload => {
    const result = firstValueFrom(repository.seguimientoActual());
    const rejection = expect(result).rejects.toThrow('conteos de seguimiento inválidos');
    http.expectOne('/api/ordenes/seguimiento-actual').flush(payload);
    await rejection;
  });
});
