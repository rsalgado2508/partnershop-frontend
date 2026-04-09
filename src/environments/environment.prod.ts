import { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: true,
  appName: 'PartnerShop',
  apiBaseUrl: 'https://api.partnershop.local',
  cognito: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_VytPzDJB4',
    domain: 'https://us-east-1vytpzdjb4.auth.us-east-1.amazoncognito.com',
    clientId: '11tflaeu8noj2gbnoqtc8j9vf0',
    redirectUri: 'https://admin.partnershopcol.com/auth/callback',
    logoutUri: 'https://admin.partnershopcol.com/login',
    responseType: 'code',
    scope: 'openid profile email',
  },
};
