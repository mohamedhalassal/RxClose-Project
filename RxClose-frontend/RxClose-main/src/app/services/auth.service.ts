import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { catchError, tap } from 'rxjs/operators';

export interface User {
  id: number;
  email: string;
  role: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredUser();
  }

  private loadStoredUser() {
    console.log('AuthService: Loading stored user...'); // Debug log
    const storedUser = localStorage.getItem(this.USER_KEY);
    console.log('AuthService: Stored user data:', storedUser); // Debug log
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        console.log('AuthService: Parsed user:', user); // Debug log
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('AuthService: Error parsing stored user:', error); // Debug log
        localStorage.removeItem(this.USER_KEY);
      }
    }
  }

  login(email: string, password: string): Observable<any> {
    console.log('Login attempt with:', { email }); // Debug log
    return this.http.post<any>(`${this.apiUrl}/users/login`, { email, password }).pipe(
      tap(response => {
        console.log('Raw login response:', response); // Debug log
        if (response && response.token) {
          console.log('Storing token and user data'); // Debug log
          localStorage.setItem(this.TOKEN_KEY, response.token);
          console.log('Token saved to localStorage with key:', this.TOKEN_KEY); // Debug log
          console.log('Saved token (first 20 chars):', response.token.substring(0, 20)); // Debug log
          
          // Ensure we have the correct role from the server
          const userData = {
            ...response.user,
            role: response.role || response.user.role
          };
          console.log('Storing user data:', userData); // Debug log
          
          localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
          this.currentUserSubject.next(userData);
          
          // Verify token is saved
          const savedToken = localStorage.getItem(this.TOKEN_KEY);
          console.log('Verification - token retrieved:', savedToken ? 'exists' : 'not found'); // Debug log
          
          // Redirect based on role
          const role = userData.role.toLowerCase();
          console.log('User role for redirection:', role); // Debug log
          
          // Immediate redirect after confirming token is saved
          console.log('About to navigate - checking token availability:');
          console.log('localStorage auth_token:', localStorage.getItem(this.TOKEN_KEY));
          console.log('getToken() returns:', this.getToken());
          console.log('isLoggedIn() returns:', this.isLoggedIn());
          
          if (role === 'admin') {
            console.log('Redirecting to pharmacy admin dashboard'); // Debug log
            this.router.navigate(['/pharmacy-admin/dashboard']);
          } else if (role === 'superadmin') {
            console.log('Redirecting to super admin dashboard'); // Debug log
            this.router.navigate(['/admin']);
          } else {
            console.log('Redirecting to home'); // Debug log
            this.router.navigate(['/auth/home']);
          }
        } else {
          console.warn('Login response missing token:', response); // Debug log
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Login error details:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message
        }); // Debug log
        let errorMessage = 'An error occurred during login';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/register`, userData);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.role.toLowerCase() === 'admin' : false;
  }

  isSuperAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.role.toLowerCase() === 'superadmin' : false;
  }

  isUser(): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.role.toLowerCase() === 'user' : false;
  }

  redirectUserByRole(): void {
    const user = this.getCurrentUser();
    if (!user) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const role = user.role.toLowerCase();
    console.log('Redirecting user with role:', role);

    switch (role) {
      case 'admin':
        this.router.navigate(['/pharmacy-admin/dashboard']);
        break;
      case 'superadmin':
        this.router.navigate(['/admin']);
        break;
      case 'user':
      default:
        this.router.navigate(['/']);
        break;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    const user = this.currentUserSubject.value;
    console.log('AuthService: Getting current user:', user); // Debug log
    return user;
  }

  updateUserProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/profile`, userData).pipe(
      tap(updatedUser => {
        localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
        this.currentUserSubject.next(updatedUser);
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/change-password`, {
      currentPassword,
      newPassword
    });
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/reset-password`, {
      token,
      newPassword
    });
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/forgot-password`, { email });
  }

  // Add method to refresh user data
  refreshUserData(): Observable<User> {
    const user = this.getCurrentUser();
    if (!user) {
      return throwError(() => new Error('No user logged in'));
    }
    
    return this.http.get<User>(`${this.apiUrl}/users/${user.id}`).pipe(
      tap(updatedUser => {
        console.log('Refreshed user data:', updatedUser); // Debug log
        localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
        this.currentUserSubject.next(updatedUser);
      })
    );
  }
} 