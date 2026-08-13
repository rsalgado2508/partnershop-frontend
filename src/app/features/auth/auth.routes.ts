import { Routes } from '@angular/router';
import { loginRedirectGuard } from '@core/auth/login-redirect.guard';
import { AuthCallbackPageComponent } from './pages/auth-callback-page.component';
import { LoginPageComponent } from './pages/login-page.component';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    title: 'Ingreso | PartnerShop',
    component: LoginPageComponent,
    canActivate: [loginRedirectGuard],
  },
];

export const AUTH_CALLBACK_ROUTES: Routes = [
  {
    path: '',
    title: 'Autenticando | PartnerShop',
    component: AuthCallbackPageComponent,
  },
];
