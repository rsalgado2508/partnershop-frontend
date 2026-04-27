import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import { environment } from '@environments/environment';
import { from, switchMap } from 'rxjs';

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const isApiRequest = request.url.startsWith(environment.apiBaseUrl);

  if (!isApiRequest) {
    return next(request);
  }

  return from(authService.getValidAccessToken()).pipe(
    switchMap((accessToken) => {
      if (!accessToken) {
        if (!environment.production) {
          console.warn('[AuthTokenInterceptor] Request sent without Authorization header', {
            method: request.method,
            url: request.urlWithParams,
          });
        }

        return next(request);
      }

      if (!environment.production) {
        console.debug('[AuthTokenInterceptor] Authorization header attached', {
          method: request.method,
          url: request.urlWithParams,
          tokenPreview: `${accessToken.slice(0, 16)}...`,
        });
      }

      return next(
        request.clone({
          setHeaders: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      );
    }),
  );
};
