import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AdminGuard = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  console.log('AdminGuard: Checking access...');
  
  const token = authService.getToken();
  const user = authService.getCurrentUserValue();
  
  console.log('AdminGuard: Token exists:', !!token);
  console.log('AdminGuard: Current user:', user);
  
  if (!token || !user) {
    console.log('AdminGuard: No token or user data, redirecting to login');
    router.navigate(['/auth/login']);
    return false;
  }
  
  const userRole = user.role?.toLowerCase();
  console.log('AdminGuard: User role:', userRole);
  
  // التحقق من أن المستخدم له دور superadmin
  if (userRole === 'superadmin') {
    console.log('AdminGuard: Access granted for super admin');
    return true;
  } else {
    console.log('AdminGuard: Access denied, user role:', userRole);
    router.navigate(['/auth/home']);
    return false;
  }
}; 