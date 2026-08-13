import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'ps-button',
  imports: [MatRippleModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      matRipple
      [type]="type()"
      [disabled]="disabled()"
      [class]="buttonClass()"
    >
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  readonly variant = input<'primary' | 'secondary' | 'ghost'>('primary');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly block = input(false);
  readonly disabled = input(false);

  protected buttonClass(): string {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-[999px] border font-semibold transition-all duration-200 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60';
    const sizeClass =
      this.size() === 'sm'
        ? 'min-h-10 px-4 text-sm'
        : this.size() === 'lg'
          ? 'min-h-13 px-6 text-[0.95rem]'
          : 'min-h-11 px-5 text-sm';
    const blockClass = this.block() ? ' w-full' : '';

    const variantClass =
      this.variant() === 'secondary'
        ? ' border-brand-200 bg-white text-brand-800 shadow-[0_14px_32px_-24px_rgba(21,90,192,0.48)] hover:border-brand-300 hover:bg-brand-50'
        : this.variant() === 'ghost'
          ? ' border-transparent bg-transparent text-ink-700 hover:bg-white hover:text-ink-950'
          : ' border-brand-600 bg-brand-600 text-white shadow-[0_22px_44px_-24px_rgba(21,90,192,0.58)] hover:-translate-y-0.5 hover:bg-brand-700';

    return base + ' ' + sizeClass + variantClass + blockClass;
  }
}
