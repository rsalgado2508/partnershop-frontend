import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ps-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section [class]="cardClass()">
      <ng-content />
    </section>
  `,
})
export class CardComponent {
  readonly tone = input<'default' | 'brand' | 'subtle'>('default');
  readonly padding = input<'sm' | 'md' | 'lg'>('md');

  protected cardClass(): string {
    const paddingClass =
      this.padding() === 'sm' ? 'p-4' : this.padding() === 'lg' ? 'p-8 md:p-9' : 'p-6';

    const toneClass =
      this.tone() === 'brand'
        ? ' border-brand-100 bg-gradient-to-br from-white via-brand-50/60 to-mint-50/70'
        : this.tone() === 'subtle'
          ? ' border-white/70 bg-white/75 backdrop-blur-sm'
          : ' border-ink-100 bg-white/92';

    return 'rounded-[1.75rem] border shadow-[0_22px_52px_-34px_rgba(15,35,65,0.22)] ' + paddingClass + toneClass;
  }
}
