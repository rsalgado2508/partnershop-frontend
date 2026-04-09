export interface AppEnvironment {
  production: boolean;
  appName: string;
  apiBaseUrl: string;
  cognito: {
    region: string;
    userPoolId: string;
    domain: string;
    clientId: string;
    redirectUri: string;
    logoutUri: string;
    responseType: 'code';
    scope: string;
  };
}
