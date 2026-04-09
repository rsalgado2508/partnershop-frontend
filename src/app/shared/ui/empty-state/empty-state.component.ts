import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'ps-empty-state',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-start gap-4 rounded-[1.5rem] border border-dashed border-ink-200 bg-ink-50/70 p-6">
      <span class="rounded-2xl bg-white p-3 text-brand-700 shadow-[0_12px_30px_-22px_rgba(21,90,192,0.5)]">
        <ps-icon [name]="icon()" [size]="22" />
      </span>
      <div>
        <h3 class="text-base font-semibold text-ink-950">{{ title() }}</h3>
        <p class="mt-2 max-w-md text-sm leading-6 text-ink-600">{{ description() }}</p>
      </div>
      <ng-content />
    </div>
  `,
})
export class EmptyStateComponent {
  readonly icon = input('sparkles');
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
