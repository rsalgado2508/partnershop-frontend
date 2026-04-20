import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavigationItem } from '@shared/models/navigation.model';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { trackByKey } from '@shared/utils/track-by.util';

@Component({
  selector: 'ps-shell-sidebar',
  imports: [RouterLink, RouterLinkActive, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside
      class="ps-shell-sidebar"
      [class.w-[var(--spacing-sidebar)]]="!collapsed()"
      [class.w-[var(--spacing-sidebar-collapsed)]]="collapsed()"
    >
      <div class="px-2 pb-5 pt-2">
        @if (!collapsed()) {
          <div class="rounded-[1.6rem] border border-white/12 bg-[#f4f1ea] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
            <img
              src="https://www.partnershopcol.com/assets/partnershop_logo_clean_2x.webp"
              alt="PartnerShop"
              class="h-auto w-full"
            />
            <div class="mt-4 border-t border-ink-200/80 pt-3 mx-auto w-fit">
              <p class="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-ink-500">
                BackOffice
              </p>
            </div>
          </div>
        } @else {
          <div class="flex justify-center">
            <div class="grid h-12 w-12 place-items-center rounded-[1.35rem] border border-white/15 bg-[#f4f1ea] shadow-[0_14px_30px_-20px_rgba(0,0,0,0.4)]">
              <img
                src="https://www.partnershopcol.com/assets/partnershop_logo_clean_2x.webp"
                alt="PartnerShop"
                class="h-7 w-7 object-contain"
              />
            </div>
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
                  <span class="rounded-2xl bg-white/8 p-2 text-white/82">
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
                      [routerLinkActiveOptions]="{ exact: true }"
                      [routerLink]="child.route ?? '/'"
                      [title]="child.label"
                    >
                      <span class="rounded-2xl bg-white/8 p-2 text-white/78">
                        <ps-icon [name]="child.icon ?? 'dashboard'" [size]="16" />
                      </span>

                      <span class="min-w-0 flex-1">
                        <span class="block truncate font-semibold">{{ child.label }}</span>
                        <span class="block truncate text-xs text-white/42">{{ child.description }}</span>
                      </span>

                    </a>
                  }
                </div>
              }
            } @else {
              <a
                class="ps-nav-item text-white/75 hover:bg-white/8 hover:text-white"
                routerLinkActive="ps-nav-item-active !bg-white/10 !text-white"
                [routerLinkActiveOptions]="{ exact: true }"
                [routerLink]="item.route ?? item.children?.[0]?.route ?? '/'"
                [title]="collapsed() ? item.label : ''"
              >
                <span class="rounded-2xl bg-white/8 p-2 text-white/82">
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
        <div class="rounded-[1.6rem] border border-white/10 bg-white/[0.06] px-5 py-4">
          @if (!collapsed()) {
            <p class="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-white/42">
              PartnerShop
            </p>
            <h3 class="mt-2 text-base font-semibold text-white">Operación con contexto</h3>
            <p class="mt-2 text-sm leading-6 text-white/60">
              Navegación interna para pedidos, seguimiento y gestión del equipo.
            </p>
          } @else {
            <div class="flex justify-center text-white/70">
              <img
                src="https://www.partnershopcol.com/assets/partnershop_logo_clean_2x.webp"
                alt="PartnerShop"
                class="h-7 w-7 rounded-full bg-[#f4f1ea] object-contain p-1"
              />
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
