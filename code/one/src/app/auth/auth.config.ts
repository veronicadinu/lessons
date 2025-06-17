import { PassedInitialConfig } from 'angular-auth-oidc-client';

export const authConfig: PassedInitialConfig = {
  config: {
              authority: 'https://dev-kpiuw0wghy7ta8x8.us.auth0.com',
              redirectUrl: window.location.origin,
              postLogoutRedirectUri: window.location.origin,
              clientId: 'dpgWyLl6arJLZfmA8RCWegCk3J0GjlJo',
              scope: 'openid profile offline_access email', // ' ' + your scopes
              responseType: 'code',
              silentRenew: true,
              useRefreshToken: true,
              renewTimeBeforeTokenExpiresInSeconds: 30,
              secureRoutes: ["/api"],
              
          }
}
