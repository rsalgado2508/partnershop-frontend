import { Routes } from '@angular/router';
import { UsersPageComponent } from './pages/users-page.component';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    title: 'Aliados | PartnerShop',
    component: UsersPageComponent,
  },
];
