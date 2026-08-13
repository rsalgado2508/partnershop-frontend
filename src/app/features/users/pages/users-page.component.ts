import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardComponent } from '@shared/ui/card/card.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'ps-users-page',
  imports: [CardComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ps-card>
      <ps-empty-state
        title="Partners & roles listos para crecer"
        description="Este módulo ya cuelga del shell principal y está preparado para guards por rol, menú dinámico y administración de acceso."
      />
    </ps-card>
  `,
})
export class UsersPageComponent {}
