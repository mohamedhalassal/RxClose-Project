import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredRoles = route.data['roles'] as Array<string>;
    const currentUser = this.authService.getCurrentUser();
    const userRole = currentUser?.role?.toLowerCase();

    console.log('RoleGuard: Required roles:', requiredRoles);
    console.log('RoleGuard: User role:', userRole);

    if (requiredRoles && userRole && requiredRoles.includes(userRole)) {
      return true;
    }

    // Redirect based on user role
    switch (userRole) {
      case 'superadmin':
        this.router.navigate(['/admin']);
        break;
      case 'admin':
        this.router.navigate(['/pharmacy-admin/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }

    return false;
  }
} 