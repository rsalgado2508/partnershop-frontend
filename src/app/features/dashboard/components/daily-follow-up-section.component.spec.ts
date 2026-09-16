import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DailyFollowUpSectionComponent } from './daily-follow-up-section.component';
import { DailyFollowUpRepository } from '../data-access/daily-follow-up.repository';
import { NovedadesCategorySummaryRepository } from '../data-access/novedades-category-summary.repository';
import { OrdersRepository } from '../../orders/data-access/orders.repository';

describe('Dashboard current guide count', () => {
  async function setup(history: unknown[] = []) {
    const list = vi.fn(() => of({ total: 122, rows: [] }));
    await TestBed.configureTestingModule({
      imports: [DailyFollowUpSectionComponent],
      providers: [
        { provide: DailyFollowUpRepository, useValue: { list: () => of(history) } },
        { provide: OrdersRepository, useValue: { list } },
        { provide: NovedadesCategorySummaryRepository, useValue: {
          listSummary: () => of({ guiasMayorA2Dias: [], mayorA20Dias: [] }),
        } },
      ],
    }).overrideComponent(DailyFollowUpSectionComponent, { set: { template: '' } }).compileComponents();
    return { component: TestBed.createComponent(DailyFollowUpSectionComponent).componentInstance, list };
  }

  it('uses the current order total without replacing historical values', async () => {
    const row = { totalGuiasMayorA2Dias: 15, totalEntre7y15: 3, totalEntre15y20: 4, totalMayorA20: 5, totalAcumulado: 27 };
    const { component, list } = await setup([row]);
    expect(component['kpiCards']()[0].value).toBe('122');
    expect(component['rows']()[0].totalGuiasMayorA2Dias).toBe(15);
    expect(component['kpiCards']()[4].value).toBe('27');
    expect(list).toHaveBeenCalledWith(expect.objectContaining({
      rangoFechaReporte: 'guias_mayor_a_2_dias', limit: 1,
      fechaReporteDesde: '', fechaReporteHasta: '',
    }));
  });

  it('shows a current count without historical snapshots and refreshes it', async () => {
    const { component, list } = await setup();
    expect(component['kpiCards']()[0].value).toBe('122');
    list.mockReturnValue(of({ total: 0, rows: [] }));
    component['reload']();
    expect(component['kpiCards']()[0].value).toBe('0');
    list.mockReturnValue(throwError(() => new Error('offline')));
    component['reload']();
    expect(component['viewState']().status).toBe('error');
    expect(component['kpiCards']()).toEqual([]);
  });
});
