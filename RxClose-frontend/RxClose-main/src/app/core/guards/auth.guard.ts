import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('AuthGuard: Checking authentication...');
    console.log('AuthGuard: Attempted URL:', state.url);
    
    const token = this.authService.getToken();
    const isLoggedIn = this.authService.isLoggedIn();
    const currentUser = this.authService.getCurrentUser();
    
    console.log('AuthGuard: Token:', token ? `exists (${token.substring(0, 20)}...)` : 'not found');
    console.log('AuthGuard: Current user:', currentUser);
    console.log('AuthGuard: isLoggedIn:', isLoggedIn);
    console.log('AuthGuard: localStorage auth_token:', localStorage.getItem('auth_token'));
    console.log('AuthGuard: localStorage token:', localStorage.getItem('token'));
    console.log('AuthGuard: localStorage keys:', Object.keys(localStorage));
    
    if (isLoggedIn && token) {
      console.log('AuthGuard: Authentication successful, allowing access');
      return true;
    }

    console.log('AuthGuard: Authentication failed, redirecting to login');
    // Store the attempted URL for redirecting
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
} 