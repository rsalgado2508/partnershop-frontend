import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardComponent } from '@shared/ui/card/card.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'ps-reports-page',
  imports: [CardComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ps-card>
      <ps-empty-state
        title="Reporting layer preparada"
        description="La base visual ya soporta KPIs, tarjetas analíticas y superficies limpias para dashboards más densos sin perder legibilidad."
      />
    </ps-card>
  `,
})
export class ReportsPageComponent {}
