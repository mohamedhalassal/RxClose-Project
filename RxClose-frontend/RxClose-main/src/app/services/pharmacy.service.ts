import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Pharmacy, PharmacyProduct } from '../models/pharmacy.model';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PharmacyService {
  private baseUrl = `${environment.apiUrl}/pharmacy`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getCurrentUserId(): string {
    const user = this.authService.getCurrentUserValue();
    return user?.id?.toString() || '0';
  }

  getPharmacyProfile(): Observable<Pharmacy> {
    // Get all pharmacies and find the one for current user
    return this.http.get<any[]>(`${this.baseUrl}`).pipe(
      map((pharmacies: any[]) => {
        const user = this.authService.getCurrentUserValue();
        console.log('Current user:', user);
        console.log('All pharmacies:', pharmacies);
        
        if (!user) {
          throw new Error('No current user found');
        }
        
        // Find pharmacy by owner email or user ID
        console.log('Looking for pharmacy with criteria:');
        console.log('- currentUser.email:', user?.email);
        console.log('- currentUser.id:', user?.id);
        
        pharmacies.forEach((p, index) => {
          console.log(`Pharmacy ${index}:`, {
            id: p.id,
            email: p.email,
            ownerId: p.ownerId,
            ownerEmail: p.ownerEmail,
            userId: p.userId
          });
        });
        
        const userPharmacy = pharmacies.find(p => 
          p.email === user?.email || 
          p.ownerId === user?.id ||
          p.ownerEmail === user?.email ||
          p.userId === user?.id
        );
        
        console.log('Found pharmacy:', userPharmacy);
        
        if (!userPharmacy) {
          throw new Error('No pharmacy found for current user');
        }
        
        return userPharmacy;
      })
    );
  }

  updatePharmacyProfile(pharmacy: Partial<Pharmacy>): Observable<Pharmacy> {
    // First get the current pharmacy to get the ID
    return this.getPharmacyProfile().pipe(
      switchMap((currentPharmacy: any) => {
        const pharmacyId = currentPharmacy.id;
        console.log('Updating pharmacy with ID:', pharmacyId);
        console.log('Current pharmacy data:', currentPharmacy);
        console.log('Update data received:', pharmacy);
        
        // Only send fields that can be updated (exclude readonly fields like id, registeredAt, etc.)
        const updateData: any = {};
        
        // Include only updatable fields (core fields like name, email, etc. are protected)
        const updatableFields = [
          'licenseNumber', 'businessHours', 
          'emergencyNumber', 'website', 'deliveryRadius', 'deliveryFee',
          'acceptsInsurance', 'description', 'specializations', 
          'latitude', 'longitude', 'profileCompleted'
        ];
        
        updatableFields.forEach(field => {
          if (pharmacy.hasOwnProperty(field) && (pharmacy as any)[field] !== undefined && (pharmacy as any)[field] !== null) {
            let value = (pharmacy as any)[field];
            
            // Handle specializations - convert array to comma-separated string
            if (field === 'specializations' && Array.isArray(value)) {
              value = value.join(', ');
            }
            
            updateData[field] = value;
          }
        });
        
        console.log('Filtered update data to send:', updateData);
        
        return this.http.put<Pharmacy>(`${this.baseUrl}/${pharmacyId}`, updateData).pipe(
          map((response: Pharmacy) => {
            console.log('Update response:', response);
            return response;
          }),
          catchError((error: any) => {
            console.error('Update error details:', error);
            console.error('Error status:', error.status);
            console.error('Error message:', error.message);
            console.error('Error body:', error.error);
            
            // Log specific validation errors if they exist
            if (error.error && error.error.errors) {
              console.error('Specific validation errors:', error.error.errors);
              // Log each validation error in detail
              Object.keys(error.error.errors).forEach(field => {
                console.error(`Validation error for field '${field}':`, error.error.errors[field]);
              });
            }
            
            throw error;
          })
        );
      })
    );
  }

  completePharmacyProfile(pharmacy: Partial<Pharmacy>): Observable<Pharmacy> {
    return this.getPharmacyProfile().pipe(
      switchMap((currentPharmacy: any) => {
        const pharmacyId = currentPharmacy.id;
        console.log('Completing pharmacy profile with ID:', pharmacyId);
        
        // Only send fields that can be updated
        const updateData: any = {};
        
        const updatableFields = [
          'licenseNumber', 'businessHours', 
          'emergencyNumber', 'website', 'deliveryRadius', 'deliveryFee',
          'acceptsInsurance', 'description', 'specializations',
          'latitude', 'longitude'
        ];
        
        updatableFields.forEach(field => {
          if (pharmacy.hasOwnProperty(field) && (pharmacy as any)[field] !== undefined && (pharmacy as any)[field] !== null) {
            let value = (pharmacy as any)[field];
            
            // Handle specializations - convert array to comma-separated string
            if (field === 'specializations' && Array.isArray(value)) {
              value = value.join(', ');
            }
            
            updateData[field] = value;
          }
        });
        
        // Always set profileCompleted to true for this function
        updateData.profileCompleted = true;
        
        return this.http.put<Pharmacy>(`${this.baseUrl}/${pharmacyId}`, updateData);
      })
    );
  }

  checkProfileCompletion(): Observable<{ completed: boolean; pharmacy: Pharmacy }> {
    // Fallback: try to get pharmacy profile and check completion
    return this.getPharmacyProfile().pipe(
      map((pharmacy: any) => ({
        completed: pharmacy.profileCompleted || false,
        pharmacy: pharmacy
      }))
    );
  }

  getProducts(): Observable<PharmacyProduct[]> {
    // First get pharmacy profile to get pharmacy ID, then get products for that pharmacy
    return this.getPharmacyProfile().pipe(
      switchMap((pharmacy: any) => {
        const pharmacyId = pharmacy.id;
        return this.http.get<PharmacyProduct[]>(`${environment.apiUrl}/Product/pharmacy/${pharmacyId}`);
      })
    );
  }

  addProduct(product: Partial<PharmacyProduct>): Observable<PharmacyProduct> {
    // Use Product controller endpoint for adding pharmacy products
    return this.http.post<PharmacyProduct>(`${environment.apiUrl}/Product/pharmacy`, product);
  }

  updateProduct(id: number, product: Partial<PharmacyProduct>): Observable<PharmacyProduct> {
    // Use Product controller endpoint for updating products
    return this.http.put<PharmacyProduct>(`${environment.apiUrl}/Product/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    // Use Product controller endpoint for deleting products
    return this.http.delete<void>(`${environment.apiUrl}/Product/${id}`);
  }

  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/orders`);
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/orders/${orderId}/status`, { status });
  }
} 