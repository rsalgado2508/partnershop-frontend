import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  model,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

export interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'ps-select',
  imports: [CommonModule, IconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="flex w-full flex-col gap-2">
      @if (label()) {
        <span class="ps-field-label">{{ label() }}</span>
      }

      <span class="ps-input-shell" [class.ps-input-shell-disabled]="disabled">
        @if (icon()) {
          <ps-icon [name]="icon()!" class="text-ink-400" [size]="18" />
        }

        <select
          class="w-full border-none bg-transparent p-0 text-sm text-ink-950 outline-none"
          [disabled]="disabled"
          [value]="value()"
          (change)="handleChange($event)"
          (blur)="onTouched()"
        >
          @for (option of options(); track option.value) {
            <option [value]="option.value">{{ option.label }}</option>
          }
        </select>
      </span>

      @if (hint()) {
        <span class="ps-field-hint">{{ hint() }}</span>
      }
    </label>
  `,
})
export class SelectComponent implements ControlValueAccessor {
  readonly label = input<string>();
  readonly hint = input<string>();
  readonly icon = input<string>();
  readonly options = input<SelectOption[]>([]);

  readonly value = model('');
  protected disabled = false;

  private onChange: (value: string) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  protected handleChange(event: Event): void {
    const nextValue = (event.target as HTMLSelectElement).value;
    this.value.set(nextValue);
    this.onChange(nextValue);
  }
}
