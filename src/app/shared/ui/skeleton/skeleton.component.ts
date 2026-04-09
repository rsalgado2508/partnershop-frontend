import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ps-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="block animate-pulse rounded-full bg-gradient-to-r from-ink-100 via-white to-ink-100"
      [style.width]="width()"
      [style.height]="height()"
    ></span>
  `,
})
export class SkeletonComponent {
  readonly width = input('100%');
  readonly height = input('1rem');
}
