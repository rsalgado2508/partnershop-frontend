import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ps-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="badgeClass()">
      <ng-content />
    </span>
  `,
})
export class BadgeComponent {
  readonly tone = input<'brand' | 'mint' | 'gold' | 'neutral'>('brand');

  protected badgeClass(): string {
    const base = 'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase';

    const toneClass =
      this.tone() === 'mint'
        ? ' bg-mint-100 text-mint-800'
        : this.tone() === 'gold'
          ? ' bg-gold-100 text-gold-800'
          : this.tone() === 'neutral'
            ? ' bg-ink-100 text-ink-700'
            : ' bg-brand-100 text-brand-800';

    return base + toneClass;
  }
}
