import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CartService } from '../../../shared/services/cart.service';

interface Medicine {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  productCategory: string;
}

@Component({
  selector: 'app-medicines',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './medicines.component.html',
  styleUrls: ['./medicines.component.scss']
})
export class MedicinesComponent implements OnInit {
  products: Medicine[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private http: HttpClient,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.error = null;

    // Using mock data temporarily until API is fixed
    const mockProducts: Medicine[] = [
      {
        id: 1,
        name: 'Paracetamol 500mg',
        description: 'مسكن للألم وخافض للحرارة',
        price: 5.99,
        image: 'https://placehold.co/400x300/1e88e5/ffffff?text=Paracetamol',
        productCategory: 'Medicines'
      },
      {
        id: 2,
        name: 'Ibuprofen 400mg',
        description: 'مسكن للألم ومضاد للالتهاب',
        price: 7.99,
        image: 'https://placehold.co/400x300/1e88e5/ffffff?text=Ibuprofen',
        productCategory: 'Medicines'
      },
      {
        id: 3,
        name: 'Vitamin C 1000mg',
        description: 'فيتامين سي لتقوية المناعة',
        price: 12.99,
        image: 'https://placehold.co/400x300/1e88e5/ffffff?text=Vitamin+C',
        productCategory: 'Medicines'
      }
    ];

    // Simulate API call
    setTimeout(() => {
      this.products = mockProducts;
      this.loading = false;
    }, 1000);

    // Commented out actual API call until backend is fixed
    /*
    this.http.get<Medicine[]>('https://rxclose-api.onrender.com/api/products', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: (data) => {
        this.products = data.filter(product => 
          product.productCategory === 'Medicines' || 
          product.productCategory === 'الأدوية'
        );
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error loading medicines:', err);
        if (err.status === 0) {
          this.error = 'لا يمكن الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.';
        } else if (err.status === 400) {
          this.error = 'طلب غير صالح. يرجى المحاولة مرة أخرى.';
        } else if (err.status === 404) {
          this.error = 'لم يتم العثور على المنتجات. يرجى المحاولة مرة أخرى لاحقاً.';
        } else {
          this.error = 'حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة أخرى لاحقاً.';
        }
        this.loading = false;
      }
    });
    */
  }

  addToCart(product: Medicine) {
    this.cartService.addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }
} 