import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BadgeComponent } from '@shared/ui/badge/badge.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { CardComponent } from '@shared/ui/card/card.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { InputComponent } from '@shared/ui/input/input.component';
import { SelectComponent, SelectOption } from '@shared/ui/select/select.component';
import { SkeletonComponent } from '@shared/ui/skeleton/skeleton.component';
import {
  Subject,
  catchError,
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import {
  CreateNovedadDrawerComponent,
  OrderNovedadDrawerData,
} from '../components/create-novedad-drawer.component';
import { OrdersRepository } from '../data-access/orders.repository';
import { OrderRow, OrdersListQuery, OrdersListResponse } from '../data-access/orders.models';

type OrdersViewState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: OrdersListResponse };

type FiltersForm = FormGroup<{
  busqueda: FormControl<string>;
  estatus: FormControl<string>;
  plataforma: FormControl<string>;
  rangoFechaReporte: FormControl<string>;
  limit: FormControl<string>;
}>;

const DEFAULT_QUERY: OrdersListQuery = {
  page: 1,
  limit: 10,
  busqueda: '',
  estatus: '',
  plataforma: '',
  rangoFechaReporte: '',
};

@Component({
  selector: 'ps-orders-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    InputComponent,
    SelectComponent,
    SkeletonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <section class="ps-panel relative overflow-hidden px-6 py-7 sm:px-8 lg:px-10">
        <div class="absolute right-0 top-0 h-44 w-44 rounded-full bg-brand-200/20 blur-3xl"></div>

        <div class="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div class="max-w-3xl">
            <div class="flex flex-wrap items-center gap-2">
              <ps-badge tone="brand">Listado de Órdenes</ps-badge>
              <!--ps-badge tone="mint">Backend NestJS</ps-badge-->
            </div>

            <h2 class="mt-5 text-3xl font-extrabold tracking-[-0.04em] text-ink-950 md:text-[2.8rem]">
              Órdenes PartnerShop <!--code>/api/ordenes</code-->
            </h2>

            <p class="mt-4 max-w-2xl text-sm leading-7 text-ink-600">
              Puedes consultar y filtrar las órdenes usando los controles de búsqueda, estatus, 
              plataforma y rango de fecha de reporte. Has clic en Aplicar filtros para consultar.
            </p>
          </div>

          <div class="grid gap-3 sm:grid-cols-3">
            <div class="ps-kpi-card min-w-[170px]">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">Página actual</p>
              <p class="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-ink-950">
                {{ currentQuery().page }}
              </p>
            </div>
            <div class="ps-kpi-card min-w-[170px]">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">Límite</p>
              <p class="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-ink-950">
                {{ currentQuery().limit }}
              </p>
            </div>
            <div class="ps-kpi-card min-w-[170px]">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">Total visible</p>
              <p class="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-ink-950">
                {{ totalItems() }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <form class="ps-filter-bar" [formGroup]="filtersForm" (ngSubmit)="applyFilters()">
        <div class="grid gap-4 xl:grid-cols-[minmax(280px,1.3fr)_220px_220px_240px_180px_auto_auto]">
          <ps-input
            label="Búsqueda"
            placeholder="Número de orden, orden tienda o guía"
            icon="search"
            formControlName="busqueda"
            hint="Usa el parámetro busqueda del backend."
          />

          <ps-select
            label="Estatus"
            icon="panel"
            formControlName="estatus"
            [options]="statusOptions"
            hint="Mapeo temporal sobre códigos numéricos."
          />

          <ps-input
            label="Plataforma"
            placeholder="Ej. Enviosexito"
            icon="box"
            formControlName="plataforma"
            hint="Filtro directo por plataforma."
          />

          <ps-select
            label="Rango fecha reporte"
            icon="calendar"
            formControlName="rangoFechaReporte"
            [options]="reportDateRangeOptions"
            hint="Filtro agrupado por antiguedad del reporte."
          />

          <ps-select
            label="Filas por página"
            icon="dashboard"
            formControlName="limit"
            [options]="pageSizeOptions"
          />

          <div class="flex items-end">
            <ps-button type="submit" [block]="true">Aplicar filtros</ps-button>
          </div>

          <div class="flex items-end">
            <ps-button type="button" variant="ghost" [block]="true" (click)="clearFilters()">
              Limpiar
            </ps-button>
          </div>
        </div>
      </form>

      <ps-card>
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
              Listado de órdenes
            </p>
            <h3 class="mt-2 text-xl font-bold tracking-[-0.03em] text-ink-950">
              Operación server-side con filtros y paginación real
            </h3>
          </div>

          <div class="text-sm text-ink-500">
            @if (ordersData()) {
              Mostrando {{ firstItemIndex() }}-{{ lastItemIndex() }} de {{ totalItems() }} órdenes
            } @else {
              Esperando respuesta del backend
            }
          </div>
        </div>

        @switch (stateStatus()) {
          @case ('loading') {
            <div class="mt-6 overflow-hidden rounded-[1.5rem] border border-ink-100">
              <table class="ps-data-table">
                <thead>
                  <tr>
                    @for (column of columns; track column) {
                      <th>{{ column }}</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (_row of skeletonRows; track $index) {
                    <tr>
                      @for (_col of columns; track $index) {
                        <td><ps-skeleton height="1rem" width="100%" /></td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @case ('error') {
            <div class="mt-6">
              <ps-empty-state
                title="No fue posible cargar las órdenes"
                [description]="errorMessage()"
              >
                <ps-button type="button" (click)="retry()">Reintentar</ps-button>
              </ps-empty-state>
            </div>
          }

          @case ('success') {
            @if (!ordersData()?.rows?.length) {
              <div class="mt-6">
                <ps-empty-state
                  title="No encontramos órdenes con los filtros actuales"
                  description="Ajusta búsqueda, estatus, plataforma o rango de fecha para volver a consultar el backend."
                >
                  <ps-button type="button" variant="secondary" (click)="clearFilters()">
                    Limpiar filtros
                  </ps-button>
                </ps-empty-state>
              </div>
            } @else {
              <div class="mt-6 overflow-hidden rounded-[1.5rem] border border-ink-100">
                <div class="overflow-x-auto">
                  <table class="ps-data-table">
                    <thead>
                      <tr>
                        <th>Id orden</th>
                        <th>Orden tienda</th>
                        <th>Cliente</th>
                        <th>Ciudad</th>
                        <th>Plataforma</th>
                        <th>Estatus</th>
                        <th>Total</th>
                        <th>Fecha reporte</th>
                        <th>Fecha creación</th>
                        <th>Guía</th>
                        <th>Transportadora</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of ordersData()?.rows ?? []; track row.idOrden) {
                        <tr>
                          <td class="font-semibold text-ink-950">{{ row.idOrden }}</td>
                          <td>{{ displayValue(row.idOrdenTienda) }}</td>
                          <td>{{ displayValue(row.clienteNombre) }}</td>
                          <td>{{ displayValue(row.ciudadNombre) }}</td>
                          <td>{{ displayValue(row.plataforma) }}</td>
                          <td>
                            <ps-badge [tone]="row.estatus.tone">{{ row.estatus.label }}</ps-badge>
                          </td>
                          <td>{{ formatCurrency(row.totalOrden) }}</td>
                          <td>{{ formatDate(row.fechaReporte) }}</td>
                          <td>{{ formatDateTime(row.fechaCreacion) }}</td>
                          <td>{{ displayValue(row.numeroGuia) }}</td>
                          <td>{{ displayValue(row.transportadoraNombre) }}</td>
                          <td>
                            <div class="flex flex-wrap gap-2">
                              <ps-button
                                size="sm"
                                variant="ghost"
                                type="button"
                                (click)="openOrderNovedadDrawer(row, 'history')"
                              >
                                Ver
                              </ps-button>
                              <ps-button
                                size="sm"
                                variant="secondary"
                                type="button"
                                (click)="openOrderNovedadDrawer(row, 'create')"
                              >
                                Registrar novedad
                              </ps-button>
                            </div>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <p class="text-sm text-ink-500">
                  Página {{ ordersData()?.page ?? 0 }} de {{ ordersData()?.totalPages ?? 0 }} ·
                  {{ ordersData()?.total ?? 0 }} órdenes totales
                </p>

                <div class="flex flex-wrap items-center gap-2">
                  <ps-button
                    size="sm"
                    variant="ghost"
                    type="button"
                    [disabled]="(ordersData()?.page ?? 1) <= 1"
                    (click)="goToPage((ordersData()?.page ?? 1) - 1)"
                  >
                    Anterior
                  </ps-button>

                  @for (page of visiblePages(); track page) {
                    <ps-button
                      size="sm"
                      [variant]="page === (ordersData()?.page ?? 1) ? 'primary' : 'ghost'"
                      type="button"
                      (click)="goToPage(page)"
                    >
                      {{ page }}
                    </ps-button>
                  }

                  <ps-button
                    size="sm"
                    variant="ghost"
                    type="button"
                    [disabled]="(ordersData()?.page ?? 1) >= (ordersData()?.totalPages ?? 1)"
                    (click)="goToPage((ordersData()?.page ?? 1) + 1)"
                  >
                    Siguiente
                  </ps-button>
                </div>
              </div>
            }
          }
        }
      </ps-card>
    </div>
  `,
})
export class OrdersPageComponent {
  protected readonly columns = [
    'Id orden',
    'Orden tienda',
    'Cliente',
    'Ciudad',
    'Plataforma',
    'Estatus',
    'Total',
    'Fecha reporte',
    'Fecha creación',
    'Guía',
    'Transportadora',
    'Acción',
  ];
  protected readonly skeletonRows = Array.from({ length: 6 });
  protected readonly pageSizeOptions: SelectOption[] = [
    { label: '10 filas', value: '10' },
    { label: '25 filas', value: '25' },
    { label: '50 filas', value: '50' },
  ];
  protected readonly statusOptions: SelectOption[] = [
    { label: 'Todos', value: '' },
    { label: '22 · Reportada', value: '22' },
    { label: '23 · Confirmada', value: '23' },
    { label: '24 · En preparación', value: '24' },
    { label: '25 · Despachada', value: '25' },
    { label: '26 · Entregada', value: '26' },
    { label: '27 · Novedad', value: '27' },
    { label: '28 · Cancelada', value: '28' },
  ];
  protected readonly reportDateRangeOptions: SelectOption[] = [
    { label: 'Todos', value: '' },
    { label: 'Últimos 7 días', value: 'ultimos_7_dias' },
    { label: 'Entre 7 y 15 días', value: 'entre_7_y_15_dias' },
    { label: 'Entre 15 y 20 días', value: 'entre_15_y_20_dias' },
    { label: 'Más de 20 días', value: 'mas_de_20_dias' },
  ];

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly ordersRepository = inject(OrdersRepository);
  private readonly reload$ = new Subject<void>();

  protected readonly filtersForm: FiltersForm = new FormGroup({
    busqueda: new FormControl('', { nonNullable: true }),
    estatus: new FormControl('', { nonNullable: true }),
    plataforma: new FormControl('', { nonNullable: true }),
    rangoFechaReporte: new FormControl('', { nonNullable: true }),
    limit: new FormControl(String(DEFAULT_QUERY.limit), { nonNullable: true }),
  });

  private readonly query$ = this.route.queryParamMap.pipe(
    map((params) => this.parseQueryParams(params)),
    distinctUntilChanged((prev, next) => JSON.stringify(prev) === JSON.stringify(next)),
    tap((query) => {
      this.filtersForm.patchValue(
        {
          busqueda: query.busqueda,
          estatus: query.estatus,
          plataforma: query.plataforma,
          rangoFechaReporte: query.rangoFechaReporte,
          limit: String(query.limit),
        },
        { emitEvent: false },
      );
    }),
  );

  protected readonly currentQuery = toSignal(this.query$, {
    initialValue: DEFAULT_QUERY,
  });

  protected readonly viewState = toSignal(
    combineLatest([this.query$, this.reload$.pipe(startWith(undefined))]).pipe(
      switchMap(([query]) =>
        this.ordersRepository.list(query).pipe(
          map((data): OrdersViewState => ({ status: 'success', data })),
          startWith({ status: 'loading' } as OrdersViewState),
          catchError(() =>
            of({
              status: 'error',
              message:
                'No se pudo conectar con el endpoint local de órdenes. Verifica que NestJS esté activo en http://localhost:3000.',
            } as OrdersViewState),
          ),
        ),
      ),
    ),
    {
      initialValue: { status: 'loading' } as OrdersViewState,
    },
  );

  protected readonly stateStatus = computed(() => this.viewState()?.status ?? 'loading');
  protected readonly ordersData = computed(() => {
    const state = this.viewState();
    return state?.status === 'success' ? state.data : null;
  });
  protected readonly errorMessage = computed(() => {
    const state = this.viewState();
    return state?.status === 'error' ? state.message : '';
  });
  protected readonly totalItems = computed(() =>
    this.ordersData()?.total ?? 0,
  );

  constructor() {
    this.filtersForm.controls.limit.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.applyFilters());
  }

  protected applyFilters(): void {
    const formValue = this.filtersForm.getRawValue();

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.serializeQuery({
        page: 1,
        limit: Number(formValue.limit) || DEFAULT_QUERY.limit,
        busqueda: formValue.busqueda.trim(),
        estatus: formValue.estatus.trim(),
        plataforma: formValue.plataforma.trim(),
        rangoFechaReporte: formValue.rangoFechaReporte.trim(),
      }),
    });
  }

  protected clearFilters(): void {
    this.filtersForm.reset(
      {
        busqueda: '',
        estatus: '',
        plataforma: '',
        rangoFechaReporte: '',
        limit: String(DEFAULT_QUERY.limit),
      },
      { emitEvent: false },
    );

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.serializeQuery(DEFAULT_QUERY),
    });
  }

  protected goToPage(page: number): void {
    const query = this.currentQuery();
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.serializeQuery({
        ...query,
        page: Math.max(1, page),
      }),
    });
  }

  protected retry(): void {
    this.reload$.next();
  }

  protected openOrderNovedadDrawer(order: OrderRow, initialView: 'create' | 'history'): void {
    const data: OrderNovedadDrawerData = {
      order,
      initialView,
    };

    this.dialog
      .open(CreateNovedadDrawerComponent, {
        data,
        autoFocus: false,
        restoreFocus: true,
        closeOnNavigation: false,
        hasBackdrop: true,
        disableClose: false,
        width: 'min(560px, 100vw)',
        maxWidth: '100vw',
        height: '100vh',
        maxHeight: '100vh',
        position: { right: '0' },
        panelClass: 'ps-drawer-dialog',
        backdropClass: 'ps-drawer-backdrop',
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result?.created) {
          this.retry();
        }
      });
  }

  protected visiblePages(): number[] {
    const data = this.ordersData();

    if (!data) {
      return [];
    }

    const { page, totalPages } = data;
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    const pages: number[] = [];

    for (let current = start; current <= end; current += 1) {
      pages.push(current);
    }

    return pages;
  }

  protected displayValue(value: string | null): string {
    return value?.trim() ? value : '—';
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

  protected firstItemIndex(): number {
    const data = this.ordersData();

    if (!data?.rows.length) {
      return 0;
    }

    return (data.page - 1) * data.limit + 1;
  }

  protected lastItemIndex(): number {
    const data = this.ordersData();

    if (!data) {
      return 0;
    }

    return this.firstItemIndex() + data.rows.length - 1;
  }

  private parseQueryParams(params: ActivatedRoute['snapshot']['queryParamMap']): OrdersListQuery {
    const page = Number(params.get('page') ?? DEFAULT_QUERY.page);
    const limit = Number(params.get('limit') ?? DEFAULT_QUERY.limit);

    return {
      page: Number.isFinite(page) && page > 0 ? page : DEFAULT_QUERY.page,
      limit: Number.isFinite(limit) && limit > 0 ? limit : DEFAULT_QUERY.limit,
      estatus: params.get('estatus')?.trim() ?? '',
      busqueda: params.get('busqueda')?.trim() ?? '',
      plataforma: params.get('plataforma')?.trim() ?? '',
      rangoFechaReporte: params.get('rangoFechaReporte')?.trim() ?? '',
    };
  }

  private serializeQuery(query: OrdersListQuery): Record<string, string | number | null> {
    return {
      page: query.page,
      limit: query.limit,
      estatus: query.estatus || null,
      busqueda: query.busqueda || null,
      plataforma: query.plataforma || null,
      rangoFechaReporte: query.rangoFechaReporte || null,
    };
  }
}
