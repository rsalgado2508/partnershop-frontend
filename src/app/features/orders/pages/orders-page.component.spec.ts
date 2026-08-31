import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { OrdersPageComponent } from './orders-page.component';
import { OrdersRepository } from '../data-access/orders.repository';
import { OrderNovedadRepository } from '../data-access/order-novedad.repository';

describe('Orders platform filter', () => {
  it('loads platforms independently of rows and preserves the selection through refresh failures', async () => {
    const queryParams = new BehaviorSubject(convertToParamMap({ plataforma: 'Meli' }));
    let response = new Subject<string[]>();
    const listPlataformas = vi.fn(() => response);
    await TestBed.configureTestingModule({
      imports: [OrdersPageComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { data: {} }, queryParamMap: queryParams } },
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(false) } },
        { provide: MatDialog, useValue: {} },
        { provide: OrdersRepository, useValue: {
          listPlataformas,
          listTransportadoras: () => of([]),
          list: () => of({ rows: [], total: 0, page: 1, limit: 10, totalPages: 0 }),
        } },
        { provide: OrderNovedadRepository, useValue: { listCategorias: () => of({ data: [] }) } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(OrdersPageComponent);
    fixture.detectChanges();
    response.next(['Dropi', 'Meli']);
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('ps-select[formControlName="plataforma"] select') as HTMLSelectElement;
    expect(Array.from(select.options).map((option) => option.value)).toEqual(['', 'Dropi', 'Meli']);
    expect(select.value).toBe('Meli');

    response = new Subject<string[]>();
    queryParams.next(convertToParamMap({ plataforma: 'Meli', page: '2' }));
    response.error(new Error('offline'));
    fixture.detectChanges();
    expect(select.value).toBe('Meli');
    expect(fixture.nativeElement.textContent).toContain('No se pudieron actualizar las plataformas');

    response = new Subject<string[]>();
    fixture.componentInstance['applyFilters']();
    await Promise.resolve();
    response.next(['Dropi', 'Meli', 'Nueva plataforma']);
    fixture.detectChanges();
    expect(Array.from(select.options).map((option) => option.value)).toContain('Nueva plataforma');
    expect(select.value).toBe('Meli');
    expect(fixture.nativeElement.textContent).not.toContain('No se pudieron actualizar las plataformas');
  });
});
