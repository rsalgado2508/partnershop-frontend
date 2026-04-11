import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { NavigationItem } from '@shared/models/navigation.model';
import { map, startWith, filter } from 'rxjs';
import { LayoutShellService } from './layout-shell.service';
import { ShellHeaderComponent } from './shell-header.component';
import { ShellNavigationService } from './shell-navigation.service';
import { ShellSidebarComponent } from './shell-sidebar.component';

@Component({
  selector: 'ps-shell',
  imports: [RouterOutlet, ShellHeaderComponent, ShellSidebarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ps-app-shell">
      <div class="flex min-h-screen">
        @if (!isMobile()) {
          <div class="sticky top-0 hidden h-screen shrink-0 p-4 lg:block">
            <ps-shell-sidebar
              [items]="navigation()"
              [collapsed]="layoutShell.desktopCollapsed()"
            />
          </div>
        }

        <div class="min-w-0 flex-1">
          <ps-shell-header
            [mobile]="isMobile()"
            [pageTitle]="currentPage().title"
            [pageDescription]="currentPage().description"
            [user]="authService.currentUser()"
            (menuClick)="layoutShell.toggleMobileSidebar()"
            (collapseClick)="layoutShell.toggleDesktopCollapsed()"
            (logoutClick)="authService.logout()"
          />

          <main class="px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            <div class="mx-auto max-w-[1600px]">
              <router-outlet />
            </div>
          </main>
        </div>
      </div>

      @if (isMobile()) {
        <button
          type="button"
          aria-label="Cerrar navegación lateral"
          class="fixed inset-0 z-40 bg-[#0f1728]/45 backdrop-blur-[3px] transition-opacity duration-200"
          [class.pointer-events-none]="!layoutShell.mobileSidebarOpen()"
          [class.opacity-0]="!layoutShell.mobileSidebarOpen()"
          [class.opacity-100]="layoutShell.mobileSidebarOpen()"
          (click)="layoutShell.closeMobileSidebar()"
        ></button>

        <div
          class="fixed inset-y-0 left-0 z-50 p-3 transition-transform duration-300 ease-out"
          [class.pointer-events-none]="!layoutShell.mobileSidebarOpen()"
          [class.translate-x-[-105%]]="!layoutShell.mobileSidebarOpen()"
          [class.translate-x-0]="layoutShell.mobileSidebarOpen()"
        >
          <div class="h-full w-[min(86vw,21rem)]">
            <ps-shell-sidebar [items]="navigation()" (click)="layoutShell.closeMobileSidebar()" />
          </div>
        </div>
      }
    </div>
  `,
})
export class ShellComponent {
  protected readonly layoutShell = inject(LayoutShellService);
  protected readonly authService = inject(AuthService);
  protected readonly navigationService = inject(ShellNavigationService);
  protected readonly navigation = this.navigationService.items;

  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);

  protected readonly isMobile = toSignal(
    this.breakpointObserver.observe('(max-width: 1023px)').pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly currentPage = computed(() => {
    const url = this.currentUrl();
    const matchedItem = findNavigationItemByRoute(this.navigation(), url);

    if (matchedItem) {
      return {
        title: matchedItem.label,
        description: matchedItem.description ?? 'Acceso disponible según tus permisos actuales.',
      };
    }

    if (url.startsWith('/orders')) {
      return {
        title: 'Operación comercial',
        description:
          'Monitorea pedidos, despacho y continuidad operativa con una jerarquía visual clara para el equipo PartnerShop.',
      };
    }

    if (url.startsWith('/users')) {
      return {
        title: 'Aliados y accesos',
        description:
          'Organiza usuarios, perfiles y permisos sobre una arquitectura preparada para roles dinámicos desde backend.',
      };
    }

    if (url.startsWith('/reports')) {
      return {
        title: 'Reportes de desempeño',
        description:
          'Centraliza indicadores, cohortes y tendencias en una capa visual lista para analítica enterprise.',
      };
    }

    if (url.startsWith('/settings')) {
      return {
        title: 'Configuración del workspace',
        description:
          'Gestiona configuración, integraciones y parámetros operativos con una experiencia consistente y escalable.',
      };
    }

    return {
      title: 'Panel ejecutivo',
      description:
        'Una vista moderna y premium para equipos que operan el ecosistema PartnerShop con claridad y control.',
    };
  });

  constructor() {
    effect(() => {
      if (!this.isMobile()) {
        this.layoutShell.closeMobileSidebar();
      }
    });

    if (this.authService.isAuthenticated()) {
      void this.navigationService.reload();
    }
  }
}

function findNavigationItemByRoute(items: NavigationItem[], currentUrl: string): NavigationItem | null {
  const flattenedItems = flattenNavigationItems(items);

  return (
    flattenedItems
      .filter((item) => item.route)
      .sort((left, right) => (right.route?.length ?? 0) - (left.route?.length ?? 0))
      .find((item) => currentUrl.startsWith(item.route!)) ?? null
  );
}

function flattenNavigationItems(items: NavigationItem[]): NavigationItem[] {
  return items.flatMap((item) => [item, ...(item.children ? flattenNavigationItems(item.children) : [])]);
}
