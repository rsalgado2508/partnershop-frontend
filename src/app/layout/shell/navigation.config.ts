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
    id: 'orders',
    label: 'Pedidos',
    description: 'Seguimiento operativo',
    icon: 'cart',
    route: '/orders'
  },
  {
    id: 'ordersFollowUp',
    label: 'Pedidos seguimiento',
    description: 'Prefiltrados por rango',
    icon: 'chart',
    route: '/orders/seguimiento',
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
    id: 'issuesCategories',
    label: 'Categorías de problemas',
    description: 'Gestión de categorías de incidencias',
    icon: 'alert',
    route: '/issues-categories',
  },
];
