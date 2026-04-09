import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavigationItem } from '@shared/models/navigation.model';
import { BadgeComponent } from '@shared/ui/badge/badge.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { trackByKey } from '@shared/utils/track-by.util';

@Component({
  selector: 'ps-shell-sidebar',
  imports: [RouterLink, RouterLinkActive, BadgeComponent, ButtonComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside
      class="ps-shell-sidebar"
      [class.w-[var(--spacing-sidebar)]]="!collapsed()"
      [class.w-[var(--spacing-sidebar-collapsed)]]="collapsed()"
    >
      <div class="flex items-center gap-3 px-2 pb-5 pt-2">
        <div class="ps-shell-brand-mark">
          <ps-icon name="sparkles" [size]="22" />
        </div>

        @if (!collapsed()) {
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold tracking-[0.22em] text-white/55 uppercase">
              PartnerShop
            </p>
            <h2 class="truncate text-lg font-semibold text-white">Centro de control</h2>
          </div>
        }
      </div>

      <div class="ps-shell-section">
        @for (item of items(); track item.id) {
          <div class="mb-1 last:mb-0">
            @if (item.children?.length && !collapsed()) {
              <button
                type="button"
                class="ps-nav-item w-full justify-between text-white/78 hover:bg-white/8 hover:text-white"
                (click)="toggleSection(item.id)"
              >
                <span class="flex items-center gap-3">
                  <span class="rounded-2xl bg-white/8 p-2 text-white/85">
                    <ps-icon [name]="item.icon ?? 'dashboard'" [size]="18" />
                  </span>
                  <span class="min-w-0 text-left">
                    <span class="block truncate font-semibold">{{ item.label }}</span>
                    <span class="block truncate text-xs text-white/45">{{ item.description }}</span>
                  </span>
                </span>

                <ps-icon [name]="isExpanded(item.id) ? 'chevronDown' : 'chevronRight'" [size]="16" />
              </button>

              @if (isExpanded(item.id)) {
                <div class="mt-2 space-y-1 pl-4">
                  @for (child of item.children; track child.id) {
                    <a
                      class="ps-nav-item group relative text-white/68 hover:bg-white/8 hover:text-white"
                      routerLinkActive="ps-nav-item-active !bg-white/10 !text-white"
                      [routerLink]="child.route ?? '/'"
                      [title]="child.label"
                    >
                      <span class="rounded-2xl bg-white/7 p-2 text-white/80">
                        <ps-icon [name]="child.icon ?? 'dashboard'" [size]="16" />
                      </span>

                      <span class="min-w-0 flex-1">
                        <span class="block truncate font-semibold">{{ child.label }}</span>
                        <span class="block truncate text-xs text-white/42">{{ child.description }}</span>
                      </span>

                      @if (child.badge) {
                        <ps-badge tone="mint">{{ child.badge }}</ps-badge>
                      }
                    </a>
                  }
                </div>
              }
            } @else {
              <a
                class="ps-nav-item text-white/75 hover:bg-white/8 hover:text-white"
                routerLinkActive="ps-nav-item-active !bg-white/10 !text-white"
                [routerLink]="item.route ?? item.children?.[0]?.route ?? '/'"
                [title]="collapsed() ? item.label : ''"
              >
                <span class="rounded-2xl bg-white/8 p-2 text-white/88">
                  <ps-icon [name]="item.icon ?? 'dashboard'" [size]="18" />
                </span>

                @if (!collapsed()) {
                  <span class="min-w-0 flex-1">
                    <span class="block truncate font-semibold">{{ item.label }}</span>
                    <span class="block truncate text-xs text-white/45">{{ item.description }}</span>
                  </span>
                }
              </a>
            }
          </div>
        }
      </div>

      <div class="mt-auto px-2 pt-5">
        <div
          class="ps-shell-promo"
        >
          @if (!collapsed()) {
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
              Progreso base
            </p>
            <h3 class="mt-2 text-base font-semibold">Sistema de diseño en evolución</h3>
            <p class="mt-2 text-sm leading-6 text-white/62">
              La base visual de PartnerShop ya está lista para crecer sin perder consistencia.
            </p>
            <div class="mt-4">
              <ps-button variant="secondary" size="sm">Explorar sistema</ps-button>
            </div>
          } @else {
            <div class="flex justify-center text-white/70">
              <ps-icon name="sparkles" [size]="20" />
            </div>
          }
        </div>
      </div>
    </aside>
  `,
})
export class ShellSidebarComponent {
  readonly items = input.required<NavigationItem[]>();
  readonly collapsed = input(false);

  private readonly expandedSections = signal<Record<string, boolean>>({
    commerce: true,
  });

  protected readonly trackByKey = trackByKey;

  protected toggleSection(sectionId: string): void {
    this.expandedSections.update((value) => ({
      ...value,
      [sectionId]: !value[sectionId],
    }));
  }

  protected isExpanded(sectionId: string): boolean {
    return this.expandedSections()[sectionId] ?? false;
  }
}
