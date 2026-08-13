import { Routes } from '@angular/router';
import { SettingsPageComponent } from './pages/settings-page.component';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    title: 'Configuración | PartnerShop',
    component: SettingsPageComponent,
  },
];
