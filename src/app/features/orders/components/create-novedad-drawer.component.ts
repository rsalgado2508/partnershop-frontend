import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BadgeComponent } from '@shared/ui/badge/badge.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import {
  Subject,
  catchError,
  finalize,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { CategoriaNovedad, Novedad } from '../data-access/order-novedad.models';
import { OrderNovedadRepository } from '../data-access/order-novedad.repository';
import { OrderRow } from '../data-access/orders.models';

type CategoriesViewState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: CategoriaNovedad[] };

type HistoryViewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: Novedad[] };

type DrawerView = 'create' | 'history';

type CreateNovedadForm = FormGroup<{
  idCategoria: FormControl<string>;
  descripcion: FormControl<string>;
}>;

export interface OrderNovedadDrawerData {
  order: OrderRow;
  initialView: DrawerView;
}

interface OrderNovedadDrawerResult {
  created: boolean;
}

@Component({
  selector: 'ps-create-novedad-drawer',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BadgeComponent,
    ButtonComponent,
    EmptyStateComponent,
    IconComponent,
    SkeletonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex h-full flex-col bg-white">
      <header class="border-b border-ink-100 px-5 py-5 sm:px-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <ps-badge tone="brand">Órdenes</ps-badge>
              <ps-badge tone="mint">Gestión de novedades</ps-badge>
            </div>

            <h2 class="mt-4 text-2xl font-extrabold tracking-[-0.04em] text-ink-950">
              Comentarios de la orden {{ order.idOrden }}
            </h2>

            <p class="mt-2 text-sm leading-6 text-ink-600">
              Gestiona el registro y consulta el historial sin salir del listado actual.
            </p>
          </div>

          <button
            class="ps-shell-icon-button h-10 w-10"
            type="button"
            aria-label="Cerrar panel de gestión de novedades"
            (click)="close()"
          >
            <ps-icon name="close" [size]="18" />
          </button>
        </div>

        <div class="mt-5 rounded-[1.4rem] bg-ink-50/85 p-1">
          <div class="grid grid-cols-2 gap-1">
            <button
              class="rounded-[1.1rem] px-4 py-3 text-sm font-semibold transition-all duration-200"
              type="button"
              [class.bg-white]="activeView() === 'create'"
              [class.text-brand-800]="activeView() === 'create'"
              [class.shadow-[0_14px_34px_-24px_rgba(15,35,65,0.34)]]="activeView() === 'create'"
              [class.text-ink-600]="activeView() !== 'create'"
              (click)="switchView('create')"
            >
              Registrar Comentario
            </button>

            <button
              class="rounded-[1.1rem] px-4 py-3 text-sm font-semibold transition-all duration-200"
              type="button"
              [class.bg-white]="activeView() === 'history'"
              [class.text-brand-800]="activeView() === 'history'"
              [class.shadow-[0_14px_34px_-24px_rgba(15,35,65,0.34)]]="activeView() === 'history'"
              [class.text-ink-600]="activeView() !== 'history'"
              (click)="switchView('history')"
            >
              Historial
            </button>
          </div>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        <section class="ps-panel-soft p-4">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">
                Resumen de la orden
              </p>
              <p class="mt-2 text-lg font-bold tracking-[-0.03em] text-ink-950">
                Orden {{ order.idOrden }}
              </p>
            </div>

            <ps-badge [tone]="order.estatus.tone">{{ order.estatus.label }}</ps-badge>
          </div>

          <dl class="mt-5 grid gap-3 sm:grid-cols-2">
            @for (item of summaryItems(); track item.label) {
              <div class="rounded-[1.2rem] bg-white/85 px-4 py-3">
                <dt class="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
                  {{ item.label }}
                </dt>
                <dd class="mt-2 text-sm font-medium text-ink-900">{{ item.value }}</dd>
              </div>
            }
          </dl>
        </section>

        @if (submitSuccess()) {
          <div class="mt-5 rounded-2xl border border-success-500/20 bg-mint-50 px-4 py-3 text-sm text-success-500">
            {{ submitSuccess() }}
          </div>
        }

        @if (submitError()) {
          <div class="mt-5 rounded-2xl border border-danger-500/25 bg-red-50 px-4 py-3 text-sm text-danger-500">
            {{ submitError() }}
          </div>
        }

        @if (activeView() === 'create') {
          <section class="mt-5">
            <form class="space-y-5" [formGroup]="form" (ngSubmit)="submit()">
              <div class="space-y-2">
                <label class="flex w-full flex-col gap-2">
                  <span class="ps-field-label">Tipificación comentario</span>

                  <span
                    class="ps-input-shell"
                    [class.ps-input-shell-disabled]="categoriesState().status !== 'success' || !activeCategories().length || isSubmitting()"
                    [class.ps-input-shell-error]="hasControlError('idCategoria')"
                  >
                    <ps-icon name="panel" class="text-ink-400" [size]="18" />

                    <select
                      class="w-full border-none bg-transparent p-0 text-sm text-ink-950 outline-none disabled:cursor-not-allowed"
                      formControlName="idCategoria"
                      [attr.aria-invalid]="hasControlError('idCategoria')"
                      [attr.disabled]="
                        categoriesState().status !== 'success' ||
                        !activeCategories().length ||
                        isSubmitting()
                          ? true
                          : null
                      "
                    >
                      <option value="">Selecciona una tipificación activa</option>

                      @for (category of activeCategories(); track category.idCategoria) {
                        <option [value]="category.idCategoria">{{ category.nombre }}</option>
                      }
                    </select>
                  </span>

                  @if (categoriesState().status === 'loading') {
                    <span class="ps-field-hint">Cargando categorías disponibles...</span>
                  } @else if (categoriesState().status === 'error') {
                    <span class="ps-field-message ps-field-message-error">
                      {{ categoriesErrorMessage() }}
                    </span>
                  } @else if (!activeCategories().length) {
                    <span class="ps-field-message ps-field-message-error">
                      No hay categorías activas disponibles para registrar la novedad.
                    </span>
                  } @else {
                    <span class="ps-field-hint">
                      Se muestran únicamente categorías activas del backend.
                    </span>
                  }

                  @if (hasControlError('idCategoria')) {
                    <span class="ps-field-message ps-field-message-error">
                      Debes seleccionar una tipificación activa.
                    </span>
                  }
                </label>

                @if (categoriesState().status === 'error') {
                  <ps-button size="sm" variant="ghost" type="button" (click)="reloadCategorias()">
                    Reintentar categorías
                  </ps-button>
                }
              </div>

              <label class="flex w-full flex-col gap-2">
                <span class="ps-field-label">Descripción</span>

                <span
                  class="ps-input-shell items-start"
                  [class.ps-input-shell-error]="hasControlError('descripcion')"
                >
                  <textarea
                    class="min-h-32 w-full resize-y border-none bg-transparent p-0 text-sm text-ink-950 outline-none placeholder:text-ink-400"
                    formControlName="descripcion"
                    rows="6"
                    placeholder="Describe claramente el comentario para que el equipo operativo pueda darle seguimiento."
                    [attr.aria-invalid]="hasControlError('descripcion')"
                  ></textarea>
                </span>

                <span class="ps-field-hint">
                  Conservaremos el texto ingresado si ocurre un error al crear el comentario.
                </span>

                @if (hasControlError('descripcion')) {
                  <span class="ps-field-message ps-field-message-error">
                    La descripción es obligatoria.
                  </span>
                }
              </label>
            </form>
          </section>
        } @else {
          <section class="mt-5">
            <div class="mb-4 flex items-center justify-between gap-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">
                  Historial de comentarios
                </p>
                <p class="mt-1 text-sm text-ink-600">
                  Cronología de la más reciente a la más antigua.
                </p>
              </div>

              @if (historyState().status === 'success') {
                <ps-badge tone="neutral">{{ historyItems().length }} registrados</ps-badge>
              }
            </div>

            @switch (historyState().status) {
              @case ('idle') {
                <div class="rounded-[1.5rem] border border-ink-100 bg-ink-50/70 px-4 py-5 text-sm text-ink-600">
                  El historial se cargará cuando abras esta vista.
                </div>
              }

              @case ('loading') {
                <div class="space-y-3">
                  @for (_item of historySkeleton; track $index) {
                    <div class="rounded-[1.5rem] border border-ink-100 bg-white p-4">
                      <div class="flex items-start gap-3">
                        <div class="mt-1 h-3 w-3 rounded-full bg-brand-200"></div>
                        <div class="min-w-0 flex-1 space-y-3">
                          <ps-skeleton height="1rem" width="40%" />
                          <ps-skeleton height="1rem" width="88%" />
                          <ps-skeleton height="1rem" width="60%" />
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }

              @case ('error') {
                <div class="rounded-[1.5rem] border border-danger-500/20 bg-red-50 px-4 py-4">
                  <p class="text-sm font-semibold text-danger-500">No fue posible cargar el historial</p>
                  <p class="mt-2 text-sm text-danger-500">{{ historyErrorMessage() }}</p>
                  <div class="mt-4">
                    <ps-button size="sm" variant="ghost" type="button" (click)="reloadHistory()">
                      Reintentar
                    </ps-button>
                  </div>
                </div>
              }

              @case ('success') {
                @if (!historyItems().length) {
                  <ps-empty-state
                    title="Sin comentarios registrados"
                    description="Esta orden aún no tiene comentarios registrados."
                  >
                    <ps-button type="button" variant="ghost" (click)="switchView('create')">
                      Registrar el primero
                    </ps-button>
                  </ps-empty-state>
                } @else {
                  <div class="space-y-4">
                    @for (item of historyItems(); track item.idNovedad) {
                      <article
                        class="relative overflow-hidden rounded-[1.6rem] border px-4 py-4 sm:px-5"
                        [class.border-brand-200]="isMostRecent(item)"
                        [class.bg-brand-50/60]="isMostRecent(item)"
                        [class.shadow-[0_22px_48px_-34px_rgba(21,90,192,0.35)]]="isMostRecent(item)"
                        [class.border-ink-100]="!isMostRecent(item)"
                        [class.bg-white]="!isMostRecent(item)"
                      >
                        <div class="flex items-start gap-3">
                          <div
                            class="mt-1 h-3 w-3 shrink-0 rounded-full"
                            [class.bg-brand-600]="isMostRecent(item)"
                            [class.bg-ink-300]="!isMostRecent(item)"
                          ></div>

                          <div class="min-w-0 flex-1">
                            <div class="flex flex-wrap items-center gap-2">
                              <p class="text-sm font-semibold text-ink-950">
                                {{ item.categoriaNombre }}
                              </p>

                              <span
                                class="rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em]"
                                [class.bg-brand-100]="item.estado === 'ABIERTA'"
                                [class.text-brand-800]="item.estado === 'ABIERTA'"
                                [class.bg-gold-100]="item.estado !== 'ABIERTA'"
                                [class.text-gold-800]="item.estado !== 'ABIERTA'"
                              >
                                {{ item.estado }}
                              </span>

                              @if (isMostRecent(item)) {
                                <ps-badge tone="brand">Más reciente</ps-badge>
                              }
                            </div>

                            <p class="mt-3 text-sm leading-6 text-ink-700">
                              {{ item.descripcion }}
                            </p>

                            <div class="mt-4 grid gap-3 sm:grid-cols-2">
                              <div class="rounded-[1.1rem] bg-ink-50/80 px-3 py-3">
                                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
                                  Usuario registro
                                </p>
                                <p class="mt-2 text-sm font-medium text-ink-900">
                                  {{ displayValue(item.usuarioRegistro) }}
                                </p>
                              </div>

                              <div class="rounded-[1.1rem] bg-ink-50/80 px-3 py-3">
                                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
                                  Fecha registro
                                </p>
                                <p class="mt-2 text-sm font-medium text-ink-900">
                                  {{ formatDateTime(item.fechaRegistro) }}
                                </p>
                              </div>

                              <div class="rounded-[1.1rem] bg-ink-50/80 px-3 py-3 sm:col-span-2">
                                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
                                  Fecha actualización
                                </p>
                                <p class="mt-2 text-sm font-medium text-ink-900">
                                  {{ formatDateTime(item.fechaActualizacion) }}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    }
                  </div>
                }
              }
            }
          </section>
        }
      </div>

      <footer class="border-t border-ink-100 px-5 py-4 sm:px-6">
        <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <ps-button type="button" variant="ghost" [disabled]="isSubmitting()" (click)="close()">
            Cerrar
          </ps-button>

          @if (activeView() === 'create') {
            <ps-button type="button" [disabled]="isSubmitDisabled()" (click)="submit()">
              {{ isSubmitting() ? 'Guardando comentario...' : 'Guardar Comentario' }}
            </ps-button>
          } @else {
            <ps-button type="button" variant="secondary" (click)="switchView('create')">
              Registrar comentario
            </ps-button>
          }
        </div>
      </footer>
    </div>
  `,
})
export class CreateNovedadDrawerComponent {
  private readonly dialogData = inject<OrderNovedadDrawerData>(MAT_DIALOG_DATA);

  protected readonly order = this.dialogData.order;

  private readonly dialogRef =
    inject(MatDialogRef<CreateNovedadDrawerComponent, OrderNovedadDrawerResult>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly orderNovedadRepository = inject(OrderNovedadRepository);
  private readonly reloadCategorias$ = new Subject<void>();
  private readonly reloadHistory$ = new Subject<void>();

  protected readonly historySkeleton = Array.from({ length: 3 });
  protected readonly activeView = signal<DrawerView>(this.dialogData.initialView);
  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal('');
  protected readonly submitSuccess = signal('');
  protected readonly hasCreated = signal(false);
  protected readonly historyState = signal<HistoryViewState>(
    this.dialogData.initialView === 'history' ? { status: 'loading' } : { status: 'idle' },
  );
  protected readonly form: CreateNovedadForm = new FormGroup({
    idCategoria: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    descripcion: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected readonly categoriesState = toSignal(
    this.reloadCategorias$.pipe(
      startWith(undefined),
      switchMap(() =>
        this.orderNovedadRepository.listCategorias().pipe(
          map((response): CategoriesViewState => ({
            status: 'success',
            data: response.data.filter((category) => category.activo),
          })),
          startWith({ status: 'loading' } as CategoriesViewState),
          catchError(() =>
            of({
              status: 'error',
              message:
                'No se pudieron cargar las categorías de novedad. Verifica que el backend local esté activo en http://localhost:3000.',
            } as CategoriesViewState),
          ),
        ),
      ),
    ),
    {
      initialValue: { status: 'loading' } as CategoriesViewState,
    },
  );

  protected readonly activeCategories = computed(() => {
    const state = this.categoriesState();
    return state.status === 'success' ? state.data : [];
  });

  protected readonly categoriesErrorMessage = computed(() => {
    const state = this.categoriesState();
    return state.status === 'error' ? state.message : '';
  });

  protected readonly historyItems = computed(() => {
    const state = this.historyState();
    return state.status === 'success' ? state.data : [];
  });

  protected readonly historyErrorMessage = computed(() => {
    const state = this.historyState();
    return state.status === 'error' ? state.message : '';
  });

  protected readonly summaryItems = computed(() => [
    { label: 'ID de orden', value: String(this.order.idOrden) },
    { label: 'Número de orden / tienda', value: this.displayValue(this.order.idOrdenTienda) },
    { label: 'Cliente', value: this.displayValue(this.order.clienteNombre) },
    { label: 'Producto', value: this.getProductNames() },
    { label: 'Ciudad', value: this.displayValue(this.order.ciudadNombre) },
    { label: 'Plataforma', value: this.displayValue(this.order.plataforma) },
    { label: 'Estado actual', value: this.order.estatus.label },
    { label: 'Total', value: this.formatCurrency(this.order.totalOrden) },
    { label: 'Fecha de reporte', value: this.formatDate(this.order.fechaReporte) },
    { label: 'Fecha de creación', value: this.formatDateTime(this.order.fechaCreacion) },
    { label: 'Guía', value: this.displayValue(this.order.numeroGuia) },
    {
      label: 'Transportadora',
      value: this.displayValue(this.order.transportadoraNombre),
    },
  ]);

  constructor() {
    this.reloadHistory$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(() => {
          this.historyState.set({ status: 'loading' });

          return this.orderNovedadRepository.listByOrder(this.order.idOrden).pipe(
            map((response) => {
              const sorted = [...response.data].sort(
                (current, next) =>
                  new Date(next.fechaRegistro).getTime() - new Date(current.fechaRegistro).getTime(),
              );

              this.historyState.set({ status: 'success', data: sorted });
            }),
            catchError(() => {
              this.historyState.set({
                status: 'error',
                message:
                  'No se pudo consultar el historial de comentarios de esta orden. Intenta nuevamente.',
              });

              return of(null);
            }),
          );
        }),
      )
      .subscribe();

    if (this.dialogData.initialView === 'history') {
      this.reloadHistory();
    }
  }

  protected close(): void {
    if (this.isSubmitting()) {
      return;
    }

    this.dialogRef.close({ created: this.hasCreated() });
  }

  protected switchView(view: DrawerView): void {
    this.activeView.set(view);

    if (view === 'history' && this.historyState().status === 'idle') {
      this.reloadHistory();
    }
  }

  protected reloadCategorias(): void {
    this.reloadCategorias$.next();
  }

  protected reloadHistory(): void {
    this.reloadHistory$.next();
  }

  protected hasControlError(controlName: 'idCategoria' | 'descripcion'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  protected isMostRecent(item: Novedad): boolean {
    return this.historyItems()[0]?.idNovedad === item.idNovedad;
  }

  protected isSubmitDisabled(): boolean {
    return (
      this.isSubmitting() ||
      this.form.invalid ||
      this.categoriesState().status !== 'success' ||
      !this.activeCategories().length
    );
  }

  protected submit(): void {
    if (this.isSubmitDisabled()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitError.set('');
    this.submitSuccess.set('');
    this.isSubmitting.set(true);

    this.orderNovedadRepository
      .create({
        idOrden: this.order.idOrden,
        idCategoria: Number(this.form.controls.idCategoria.getRawValue()),
        descripcion: this.form.controls.descripcion.getRawValue().trim(),
      })
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        catchError((error) => {
          this.submitError.set(
            error instanceof Error
              ? error.message
              : 'No fue posible registrar la novedad. Intenta nuevamente sin cerrar el panel.',
          );

          return of(null);
        }),
      )
      .subscribe((response) => {
        if (!response) {
          return;
        }

        this.hasCreated.set(true);
        this.submitSuccess.set('La novedad se registró correctamente. Historial actualizado.');
        this.activeView.set('history');
        this.reloadHistory();
      });
  }

  protected displayValue(value: string | null): string {
    return value?.trim() ? value : '—';
  }

  protected getProductNames(): string {
    const names = this.order.detalles
      .map((detail) => detail.producto?.nombreOficial?.trim() ?? '')
      .filter((name) => !!name);

    return names.length ? names.join(', ') : '—';
  }

  protected formatCurrency(value: number | null): string {
    if (value === null) {
      return '—';
    }

    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);
  }

  protected formatDate(value: string | null): string {
    if (!value) {
      return '—';
    }

    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
    }).format(new Date(value));
  }

  protected formatDateTime(value: string | null): string {
    if (!value) {
      return '—';
    }

    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }
}
