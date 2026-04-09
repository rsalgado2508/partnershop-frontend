import { NavigationItem } from '@shared/models/navigation.model';

export const SHELL_NAVIGATION: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Inicio',
    description: 'Resumen ejecutivo',
    icon: 'dashboard',
    route: '/dashboard',
  },
  {
    id: 'commerce',
    label: 'Operación comercial',
    description: 'Ventas y pedidos',
    icon: 'box',
    children: [
      {
        id: 'orders',
        label: 'Pedidos',
        description: 'Seguimiento operativo',
        icon: 'cart',
        route: '/orders',
        badge: 'Activo',
      },
    ],
  },
  {
    id: 'users',
    label: 'Aliados',
    description: 'Usuarios y roles',
    icon: 'users',
    route: '/users',
  },
  {
    id: 'reports',
    label: 'Reportes',
    description: 'Análisis y métricas',
    icon: 'chart',
    route: '/reports',
  },
  {
    id: 'settings',
    label: 'Configuración',
    description: 'Configuración global',
    icon: 'settings',
    route: '/settings',
  },
];
