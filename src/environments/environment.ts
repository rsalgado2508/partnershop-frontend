import { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: false,
  appName: 'PartnerShop',
  apiBaseUrl: 'http://localhost:3000/api',
  cognito: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_VytPzDJB4',
    domain: 'https://us-east-1vytpzdjb4.auth.us-east-1.amazoncognito.com',
    clientId: '11tflaeu8noj2gbnoqtc8j9vf0',
    redirectUri: 'http://localhost:4200/auth/callback',
    logoutUri: 'http://localhost:4200/login',
    responseType: 'code',
    scope: 'openid profile email',
  },
};
