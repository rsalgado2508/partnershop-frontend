import { ChangeDetectionStrategy, Component, HostListener, input, output, signal } from '@angular/core';
import { AuthenticatedUser } from '@core/auth/authenticated-user.model';
import { BadgeComponent } from '@shared/ui/badge/badge.component';
import { IconComponent } from '@shared/ui/icon/icon.component';

@Component({
  selector: 'ps-shell-header',
  imports: [BadgeComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="ps-topbar">
      <div
        class="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8"
      >
        <div class="flex min-w-0 items-start gap-3 sm:items-center">
          @if (mobile()) {
            <button
              type="button"
              class="ps-shell-icon-button"
              (click)="menuClick.emit()"
            >
              <ps-icon name="menu" [size]="20" />
            </button>
          } @else {
            <button
              type="button"
              class="ps-shell-icon-button"
              (click)="collapseClick.emit()"
            >
              <ps-icon name="panel" [size]="20" />
            </button>
          }

          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <ps-badge tone="brand">PartnerShop Admin</ps-badge>
              <ps-badge tone="mint">Panel corporativo</ps-badge>
            </div>
            <h1 class="mt-3 truncate text-2xl font-extrabold tracking-[-0.03em] text-ink-950 sm:text-[2rem]">
              {{ pageTitle() }}
            </h1>
            <p class="mt-1 max-w-2xl text-sm leading-6 text-ink-600">
              {{ pageDescription() }}
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <!--div class="w-full sm:min-w-[280px] sm:max-w-[320px]">
            <ps-input
              label="Buscar"
              placeholder="Pedidos, aliados, reportes..."
              hint="Campo base listo para integrarse con búsqueda global."
              icon="search"
              type="search"
            />
          </div-->

          <div class="flex items-center gap-3">
            <!--button
              type="button"
              class="ps-shell-icon-button"
            >
              <ps-icon name="bell" [size]="19" />
            </button>

            <ps-button size="md">
              <ps-icon name="plus" [size]="18" />
              Nueva acción
            </ps-button-->

            @if (user()) {
              <div class="ps-user-menu">
                <button
                  type="button"
                  class="ps-user-chip"
                  (click)="toggleUserMenu()"
                >
                  <div class="ps-user-chip-mark">
                    {{ user()!.initials }}
                  </div>
                  <div class="text-left">
                    <p class="text-sm font-semibold text-ink-900">
                      {{ user()!.name || user()!.email }}
                    </p>
                    <p class="text-xs text-ink-500">
                      {{ user()!.primaryRole }} · {{ user()!.email }}
                    </p>
                  </div>
                </button>

                @if (userMenuOpen()) {
                  <div class="ps-user-menu-panel">
                    <div class="flex items-center gap-3 rounded-2xl bg-ink-50 px-3 py-3">
                      <div class="ps-user-chip-mark h-12 w-12 text-base">
                        {{ user()!.initials }}
                      </div>
                      <div>
                        <p class="text-sm font-semibold text-ink-900">
                          {{ user()!.name || user()!.email }}
                        </p>
                        <p class="text-xs text-ink-500">{{ user()!.email }}</p>
                        <p class="mt-1 text-xs font-medium text-brand-700">
                          Rol principal: {{ user()!.primaryRole }}
                        </p>
                      </div>
                    </div>

                    <div class="mt-3">
                      <button
                        type="button"
                        class="ps-user-menu-action"
                        (click)="handleLogout()"
                      >
                        <ps-icon name="lock" [size]="18" />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </header>
  `,
})
export class ShellHeaderComponent {
  readonly pageTitle = input.required<string>();
  readonly pageDescription = input.required<string>();
  readonly mobile = input(false);
  readonly user = input<AuthenticatedUser | null>(null);

  readonly menuClick = output<void>();
  readonly collapseClick = output<void>();
  readonly logoutClick = output<void>();

  protected readonly userMenuOpen = signal(false);

  protected toggleUserMenu(): void {
    this.userMenuOpen.update((value) => !value);
  }

  protected handleLogout(): void {
    this.userMenuOpen.set(false);
    this.logoutClick.emit();
  }

  @HostListener('document:click', ['$event'])
  protected closeMenuOnDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;

    if (target?.closest('.ps-user-menu')) {
      return;
    }

    this.userMenuOpen.set(false);
  }
}
