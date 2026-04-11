import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import { environment } from '@environments/environment';
import { NavigationItem } from '@shared/models/navigation.model';
import { firstValueFrom } from 'rxjs';
import { SHELL_NAVIGATION } from './navigation.config';

export type MenuItem = {
  key: string;
  label: string;
  icon?: string;
  route: string;
  children?: MenuItem[];
};

export type MenuResponse = {
  statusCode: number;
  data: MenuItem[];
  timestamp: string;
};

const ICON_ALIASES: Record<string, string> = {
  category: 'settings',
  dashboard: 'dashboard',
  group: 'users',
  shopping_cart: 'cart',
};

const ROUTE_ALIASES: Record<string, string> = {
  '/ordenes': '/orders',
  '/usuarios': '/users',
  '/configuracion/categorias-novedad': '/settings',
};

const MENU_DESCRIPTIONS: Record<string, string> = {
  dashboard: 'Resumen ejecutivo',
  orders: 'Seguimiento operativo',
  issue_category: 'Gestión de categorías de incidencias',
  users: 'Usuarios y roles',
};

@Injectable({
  providedIn: 'root',
})
export class ShellNavigationService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly itemsState = signal<NavigationItem[]>(SHELL_NAVIGATION);
  private readonly loadingState = signal(false);
  private readonly sourceState = signal<'static' | 'api'>('static');
  private lastLoadedToken: string | null = null;

  readonly items = computed(() => this.itemsState());
  readonly loading = computed(() => this.loadingState());
  readonly source = computed(() => this.sourceState());

  constructor() {
    effect(() => {
      const accessToken = this.authService.accessToken();

      if (!accessToken) {
        this.lastLoadedToken = null;
        this.loadingState.set(false);
        this.itemsState.set(SHELL_NAVIGATION);
        this.sourceState.set('static');
        return;
      }

      if (this.lastLoadedToken === accessToken) {
        return;
      }

      void this.loadMenu(accessToken);
    });
  }

  async reload(): Promise<void> {
    const accessToken = this.authService.accessToken();

    if (!accessToken) {
      this.itemsState.set(SHELL_NAVIGATION);
      this.sourceState.set('static');
      return;
    }

    this.lastLoadedToken = null;
    await this.loadMenu(accessToken);
  }

  private async loadMenu(accessToken: string): Promise<void> {
    this.loadingState.set(true);

    try {
      const response = await firstValueFrom(this.http.get<unknown>(`${environment.apiBaseUrl}/auth/menu`));
      const menuItems = this.extractMenuItems(response);

      this.itemsState.set(menuItems.map((item) => this.toNavigationItem(item)));
      this.sourceState.set('api');
      this.lastLoadedToken = accessToken;

      if (!environment.production) {
        console.info('[ShellNavigationService] Menú autenticado cargado desde backend.', response);
      }
    } catch (error) {
      if (!environment.production) {
        console.error('[ShellNavigationService] No fue posible cargar el menú autenticado.', error);
      }

      this.itemsState.set(SHELL_NAVIGATION);
      this.sourceState.set('static');
    } finally {
      this.loadingState.set(false);
    }
  }

  private toNavigationItem(item: MenuItem): NavigationItem {
    return {
      id: item.key,
      label: item.label,
      icon: this.normalizeIcon(item.icon),
      route: this.normalizeRoute(item.route),
      description: MENU_DESCRIPTIONS[item.key] ?? 'Acceso habilitado por roles',
      children: item.children?.map((child) => this.toNavigationItem(child)),
    };
  }

  private normalizeIcon(icon?: string): string {
    if (!icon) {
      return 'dashboard';
    }

    return ICON_ALIASES[icon] ?? icon;
  }

  private normalizeRoute(route?: string): string {
    if (!route) {
      return '/dashboard';
    }

    return ROUTE_ALIASES[route] ?? route;
  }

  private extractMenuItems(response: unknown): MenuItem[] {
    if (!response || typeof response !== 'object') {
      throw new TypeError('La respuesta de api/auth/menu no es un objeto válido.');
    }

    const body = response as {
      data?: unknown;
    };

    const topLevelData = body.data;

    if (Array.isArray(topLevelData)) {
      return topLevelData.filter((item): item is MenuItem => this.isMenuItem(item));
    }

    if (topLevelData && typeof topLevelData === 'object') {
      const nestedData = (topLevelData as { data?: unknown }).data;

      if (Array.isArray(nestedData)) {
        return nestedData.filter((item): item is MenuItem => this.isMenuItem(item));
      }
    }

    throw new TypeError('La respuesta de api/auth/menu no contiene un arreglo en response.data ni en response.data.data.');
  }

  private isMenuItem(value: unknown): value is MenuItem {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const candidate = value as Partial<MenuItem>;

    if (
      typeof candidate.key !== 'string' ||
      typeof candidate.label !== 'string' ||
      typeof candidate.route !== 'string'
    ) {
      return false;
    }

    if (candidate.children === undefined) {
      return true;
    }

    return Array.isArray(candidate.children) && candidate.children.every((child) => this.isMenuItem(child));
  }
}
