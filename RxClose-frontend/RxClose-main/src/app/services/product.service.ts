import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/Product`;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateProduct(product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${product.id}`, product)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/search`, {
      params: { query }
    }).pipe(
      catchError(this.handleError)
    );
  }

  searchNearbyProducts(query: string, latitude: number, longitude: number, maxDistance: number = 50): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search-nearby`, {
      params: {
        query,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        maxDistance: maxDistance.toString()
      }
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('ProductService error:', error);
    
    if (error.status === 404) {
      return throwError(() => new Error('Product not found'));
    } else if (error.status === 0) {
      return throwError(() => new Error('Unable to connect to server'));
    } else {
      return throwError(() => new Error(`Error ${error.status}: ${error.message}`));
    }
  }
} 