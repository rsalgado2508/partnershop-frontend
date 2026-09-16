import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DailyFollowUpSectionComponent } from './daily-follow-up-section.component';
import { DailyFollowUpRepository } from '../data-access/daily-follow-up.repository';
import { NovedadesCategorySummaryRepository } from '../data-access/novedades-category-summary.repository';
import { OrdersRepository } from '../../orders/data-access/orders.repository';

describe('Dashboard current guide count', () => {
  async function setup(history: unknown[] = []) {
    const list = vi.fn(() => of({ guiasMayorA2Dias: 122, entre7y15: 10, entre15y20: 20, mayorA20: 30, totalUnico: 150 }));
    await TestBed.configureTestingModule({
      imports: [DailyFollowUpSectionComponent],
      providers: [
        { provide: DailyFollowUpRepository, useValue: { list: () => of(history) } },
        { provide: OrdersRepository, useValue: { seguimientoActual: list } },
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
    expect(component['kpiCards']().map(card => card.value)).toEqual(['122', '10', '20', '30', '150']);
    expect(list).toHaveBeenCalledWith();
  });

  it('shows a current count without historical snapshots and refreshes it', async () => {
    const { component, list } = await setup();
    expect(component['kpiCards']()[0].value).toBe('122');
    list.mockReturnValue(of({ guiasMayorA2Dias: 0, entre7y15: 0, entre15y20: 0, mayorA20: 0, totalUnico: 0 }));
    component['reload']();
    expect(component['kpiCards']()[0].value).toBe('0');
    list.mockReturnValue(throwError(() => new Error('offline')));
    component['reload']();
    expect(component['viewState']().status).toBe('error');
    expect(component['kpiCards']()).toEqual([]);
  });
});
