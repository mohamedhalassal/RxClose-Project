import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // User Management
  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`, { headers: this.getHeaders() });
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${id}`, { headers: this.getHeaders() });
  }

  createUser(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, user, { headers: this.getHeaders() });
  }

  updateUser(id: string, user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}`, user, { headers: this.getHeaders() });
  }

  updateUserRole(id: string, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}/role`, { role }, { headers: this.getHeaders() });
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`, { headers: this.getHeaders() });
  }

  // Pharmacy Management
  getPharmacies(): Observable<any> {
    return this.http.get(`${this.apiUrl}/pharmacies`, { headers: this.getHeaders() });
  }

  getPharmacyById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/pharmacies/${id}`, { headers: this.getHeaders() });
  }

  createPharmacy(pharmacy: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/pharmacies`, pharmacy, { headers: this.getHeaders() });
  }

  updatePharmacy(id: string, pharmacy: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/pharmacies/${id}`, pharmacy, { headers: this.getHeaders() });
  }

  deletePharmacy(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/pharmacies/${id}`, { headers: this.getHeaders() });
  }

  // Product Management
  getProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/products`, { headers: this.getHeaders() });
  }

  getProductById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/products/${id}`, { headers: this.getHeaders() });
  }

  createProduct(product: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/products`, product, { headers: this.getHeaders() });
  }

  updateProduct(id: string, product: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/products/${id}`, product, { headers: this.getHeaders() });
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/products/${id}`, { headers: this.getHeaders() });
  }

  // Reports endpoints
  getDashboardStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports/dashboard-statistics`, { headers: this.getHeaders() });
  }

  getRevenueChart(period: string = '30days'): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports/revenue-chart?period=${period}`, { headers: this.getHeaders() });
  }

  getTopProducts(limit: number = 5): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports/top-products?limit=${limit}`, { headers: this.getHeaders() });
  }

  getTopPharmacies(limit: number = 5): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports/top-pharmacies?limit=${limit}`, { headers: this.getHeaders() });
  }

  getRecentOrders(limit: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports/recent-orders?limit=${limit}`, { headers: this.getHeaders() });
  }

  getSystemActivity(limit: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports/system-activity?limit=${limit}`, { headers: this.getHeaders() });
  }

  getUserAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports/user-analytics`, { headers: this.getHeaders() });
  }

  getPharmacyPerformance(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports/pharmacy-performance`, { headers: this.getHeaders() });
  }
} 