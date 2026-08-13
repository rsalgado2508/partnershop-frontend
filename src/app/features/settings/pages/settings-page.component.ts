import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardComponent } from '@shared/ui/card/card.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'ps-settings-page',
  imports: [CardComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ps-card>
      <ps-empty-state
        title="Configuración desacoplada por environments"
        description="La estructura actual separa concerns de despliegue, auth y configuración para que las siguientes fases conecten Cognito y backend sin rehacer layout."
      />
    </ps-card>
  `,
})
export class SettingsPageComponent {}
