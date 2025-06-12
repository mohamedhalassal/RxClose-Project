import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

console.log('%c[DEBUG] AuthInterceptor file loaded', 'color: green; font-weight: bold;');

@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();

    console.log('%c[DEBUG] Intercepting request:', 'color: blue;', request.url);
    console.log('%c[DEBUG] Token from AuthService:', 'color: blue;', token);

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('%c[DEBUG] Authorization header set:', 'color: blue;', request.headers.get('Authorization'));
    } else {
      console.warn('%c[DEBUG] No token found, Authorization header NOT set', 'color: orange;');
    }

    return next.handle(request).pipe(
      tap(response => {
        console.log('%c[DEBUG] Response received:', 'color: green;', response);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('%c[DEBUG] HTTP Error:', 'color: red;', error);
        if (error.status === 401) {
          console.log('AuthInterceptor: Unauthorized access, redirecting to login');
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
} 