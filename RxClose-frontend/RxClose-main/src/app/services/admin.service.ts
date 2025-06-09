import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Products Management
  getProducts(category?: string, status?: string): Observable<any> {
    let url = `${this.baseUrl}/Product`;
    const params = [];
    if (category) params.push(`category=${category}`);
    if (status) params.push(`status=${status}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return this.http.get(url);
  }

  // Get RxClose products only
  getRxCloseProducts(category?: string, status?: string): Observable<any> {
    let url = `${this.baseUrl}/Product/rxclose`;
    const params = [];
    if (category) params.push(`category=${category}`);
    if (status) params.push(`status=${status}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return this.http.get(url);
  }

  // Get Pharmacy products only (all pharmacies)
  getAllPharmacyProducts(category?: string, status?: string): Observable<any> {
    let url = `${this.baseUrl}/Product/pharmacy-products`;
    const params = [];
    if (category) params.push(`category=${category}`);
    if (status) params.push(`status=${status}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return this.http.get(url);
  }

  getProduct(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/Product/${id}`);
  }

  createProduct(product: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Product`, product, {
      headers: this.getAuthHeaders()
    });
  }

  // Create RxClose product (Super Admin only)
  createRxCloseProduct(product: any): Observable<any> {
    console.log('Creating RxClose product:', product);
    return this.http.post(`${this.baseUrl}/Product/rxclose`, product, {
      headers: this.getAuthHeaders()
    });
  }

  // Create Pharmacy product
  createPharmacyProduct(product: any): Observable<any> {
    console.log('Creating pharmacy product:', product);
    return this.http.post(`${this.baseUrl}/Product/pharmacy`, product, {
      headers: this.getAuthHeaders()
    });
  }

  updateProduct(id: string, product: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/Product/${id}`, product, {
      headers: this.getAuthHeaders()
    });
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Product/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Pharmacies Management
  getPharmacies(): Observable<any> {
    return this.http.get(`${this.baseUrl}/pharmacy`);
  }

  getPharmacy(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/pharmacy/${id}`);
  }

  createPharmacy(pharmacy: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/pharmacy`, pharmacy, {
      headers: this.getAuthHeaders()
    });
  }

  updatePharmacy(id: string, pharmacy: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/pharmacy/${id}`, pharmacy, {
      headers: this.getAuthHeaders()
    });
  }

  // Admin-only pharmacy update (all fields)
  adminUpdatePharmacy(id: string, pharmacy: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/pharmacy/${id}/admin`, pharmacy, {
      headers: this.getAuthHeaders()
    });
  }

  // Pharmacy Products Management
  getPharmacyProducts(userId: string, pharmacyId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/${userId}/pharmacies/${pharmacyId}/Medicines`);
  }

  assignMedicineToPharmacy(pharmacyId: string, medicineId: string, data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/pharmacies/${pharmacyId}/assign/Medicines/${medicineId}`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  updatePharmacyMedicine(pharmacyId: string, medicineId: string, data: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/pharmacies/${pharmacyId}/Medicines/${medicineId}`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  // Users Management
  getUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users`);
  }

  getUser(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/${id}`);
  }

  createUser(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users`, user, {
      headers: this.getAuthHeaders()
    });
  }

  updateUser(id: string, user: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${id}`, user, {
      headers: this.getAuthHeaders()
    });
  }

  updateUserRole(id: string, role: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${id}/role`, { role }, {
      headers: this.getAuthHeaders()
    });
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Dashboard Statistics
  getDashboardStatistics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/Dashboard/statistics`);
  }

  getRevenueChart(): Observable<any> {
    return this.http.get(`${this.baseUrl}/Dashboard/charts/revenue`);
  }

  getOrdersChart(): Observable<any> {
    return this.http.get(`${this.baseUrl}/Dashboard/charts/orders`);
  }

  getProductsChart(): Observable<any> {
    return this.http.get(`${this.baseUrl}/Dashboard/charts/products`);
  }
}