import { Routes } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard-page.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    title: 'Inicio | PartnerShop',
    component: DashboardPageComponent,
  },
];
