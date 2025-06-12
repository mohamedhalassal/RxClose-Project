import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PharmacyService } from '../services/pharmacy.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const ProfileCompletionGuard = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const pharmacyService = inject(PharmacyService);
  
  console.log('ProfileCompletionGuard: Checking profile completion...');
  
  const user = authService.getCurrentUserValue();
  
  // إذا لم يكن المستخدم مسجل دخول أو ليس admin، السماح بالوصول
  if (!user || user.role?.toLowerCase() !== 'admin') {
    console.log('ProfileCompletionGuard: User is not pharmacy admin, allowing access');
    return true;
  }
  
  // إذا كان المستخدم في صفحة البروفايل، السماح بالوصول
  const currentUrl = router.url;
  if (currentUrl.includes('/profile')) {
    console.log('ProfileCompletionGuard: User is accessing profile page, allowing access');
    return true;
  }
  
  // التحقق من اكتمال البروفايل
  return pharmacyService.getPharmacyProfile().pipe(
    map(pharmacy => {
      console.log('ProfileCompletionGuard: Pharmacy profile:', pharmacy);
      
      // Check if profile is completed
      const isCompleted = pharmacy.profileCompleted === true;
      
      if (!isCompleted) {
        console.log('ProfileCompletionGuard: Profile not completed, redirecting to profile page');
        router.navigate(['/pharmacy-admin/profile'], { 
          queryParams: { firstLogin: true }
        });
        return false;
      }
      
      console.log('ProfileCompletionGuard: Profile completed, allowing access');
      return true;
    }),
    catchError(error => {
      console.error('ProfileCompletionGuard: Error checking profile:', error);
      // إذا حدث خطأ، توجيه للبروفايل ليتمكن المستخدم من إدخال بياناته
      console.log('ProfileCompletionGuard: Redirecting to profile due to error');
      router.navigate(['/pharmacy-admin/profile'], { 
        queryParams: { firstLogin: true }
      });
      return of(false);
    })
  );
}; 