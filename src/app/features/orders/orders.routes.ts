import { Routes } from '@angular/router';
import { OrdersPageComponent } from './pages/orders-page.component';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    title: 'Pedidos | PartnerShop',
    component: OrdersPageComponent,
  },
];
