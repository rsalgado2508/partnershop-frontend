import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import { DailyFollowUpSectionComponent } from '../components/daily-follow-up-section.component';

@Component({
  selector: 'ps-dashboard-page',
  imports: [
    DailyFollowUpSectionComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 lg:space-y-7">
      

      <ps-daily-follow-up-section />

    </div>
  `,
})
export class DashboardPageComponent {
  protected readonly authService = inject(AuthService);
}
