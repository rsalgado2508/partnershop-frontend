import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  output,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'ps-input',
  imports: [CommonModule, IconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="flex w-full flex-col gap-2">
      @if (label()) {
        <span class="ps-field-label">{{ label() }}</span>
      }

      <span [class]="shellClass()">
        @if (icon()) {
          <ps-icon [name]="icon()!" class="text-ink-400" [size]="18" />
        }

        <input
          class="w-full border-none bg-transparent p-0 text-sm text-ink-950 outline-none placeholder:text-ink-400"
          [attr.type]="type()"
          [attr.placeholder]="placeholder()"
          [attr.aria-invalid]="hasError()"
          [attr.aria-describedby]="describedBy()"
          [disabled]="disabled"
          [value]="value()"
          (input)="handleInput($event)"
          (blur)="onTouched()"
        />
      </span>

      @if (hint()) {
        <span class="ps-field-hint" [id]="hintId">{{ hint() }}</span>
      }

      @if (hasError()) {
        <span class="ps-field-message ps-field-message-error" [id]="messageId">
          {{ errorMessage() }}
        </span>
      } @else if (hasSuccess()) {
        <span class="ps-field-message ps-field-message-success" [id]="messageId">
          {{ successMessage() }}
        </span>
      }
    </label>
  `,
})
export class InputComponent implements ControlValueAccessor {
  readonly label = input<string>();
  readonly hint = input<string>();
  readonly placeholder = input('');
  readonly type = input<'text' | 'email' | 'password' | 'search' | 'date'>('text');
  readonly icon = input<string>();
  readonly errorMessage = input<string>();
  readonly successMessage = input<string>();
  readonly state = input<'default' | 'error' | 'success'>('default');
  readonly valueChange = output<string>();

  readonly value = model('');
  protected disabled = false;
  protected readonly inputId = `ps-input-${Math.random().toString(36).slice(2, 9)}`;
  protected readonly hintId = `${this.inputId}-hint`;
  protected readonly messageId = `${this.inputId}-message`;
  protected readonly hasError = computed(
    () => this.state() === 'error' || !!this.errorMessage()?.trim(),
  );
  protected readonly hasSuccess = computed(
    () => !this.hasError() && (this.state() === 'success' || !!this.successMessage()?.trim()),
  );

  private onChange: (value: string) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  protected shellClass(): string {
    if (this.disabled) {
      return 'ps-input-shell ps-input-shell-disabled';
    }

    if (this.hasError()) {
      return 'ps-input-shell ps-input-shell-error';
    }

    if (this.hasSuccess()) {
      return 'ps-input-shell ps-input-shell-success';
    }

    return 'ps-input-shell';
  }

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

  protected describedBy(): string | null {
    if (this.hasError() || this.hasSuccess()) {
      return this.messageId;
    }

    if (this.hint()) {
      return this.hintId;
    }

    return null;
  }

  protected handleInput(event: Event): void {
    const nextValue = (event.target as HTMLInputElement).value;
    this.value.set(nextValue);
    this.valueChange.emit(nextValue);
    this.onChange(nextValue);
  }
}
