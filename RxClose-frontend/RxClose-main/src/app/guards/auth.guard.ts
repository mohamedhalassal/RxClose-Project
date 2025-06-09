import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  console.log('authGuard: Checking authentication...');
  
  const token = authService.getToken();
  const isLoggedIn = authService.isLoggedIn();
  
  console.log('authGuard: Token exists:', !!token);
  console.log('authGuard: isLoggedIn:', isLoggedIn);
  
  if (isLoggedIn && token) {
    console.log('authGuard: Authentication successful, allowing access');
    return true;
  } else {
    console.log('authGuard: Authentication failed, redirecting to login');
    router.navigate(['/auth/login']);
    return false;
  }
}; 