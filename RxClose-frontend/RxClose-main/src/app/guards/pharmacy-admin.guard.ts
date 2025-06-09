import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const PharmacyAdminGuard = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  console.log('PharmacyAdminGuard: Checking access...');
  
  const token = authService.getToken();
  const currentUser = authService.getCurrentUser();
  
  console.log('PharmacyAdminGuard: Token exists:', !!token);
  console.log('PharmacyAdminGuard: Current user:', currentUser);
  
  if (!token || !currentUser) {
    console.log('PharmacyAdminGuard: No token or user data, redirecting to login');
    router.navigate(['/auth/login']);
    return false;
  }
  
  const userRole = currentUser.role?.toLowerCase();
  console.log('PharmacyAdminGuard: User role:', userRole);
  
  // التحقق من أن المستخدم له دور admin (pharmacy owner)
  if (userRole === 'admin') {
    console.log('PharmacyAdminGuard: Access granted for pharmacy admin');
    return true;
  } else {
    console.log('PharmacyAdminGuard: Access denied, user role:', userRole);
    router.navigate(['/auth/home']);
    return false;
  }
}; 