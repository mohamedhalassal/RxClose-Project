import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CartService } from '../../../shared/services/cart.service';

interface MedicalSupply {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  productCategory: string;
}

@Component({
  selector: 'app-medical-supplies',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './medical-supplies.component.html',
  styleUrls: ['./medical-supplies.component.scss']
})
export class MedicalSuppliesComponent implements OnInit {
  products: MedicalSupply[] = [];
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
    const mockProducts: MedicalSupply[] = [
      {
        id: 1,
        name: 'Medical Gloves',
        description: 'قفازات طبية معقمة',
        price: 12.99,
        image: 'https://placehold.co/400x300/1e88e5/ffffff?text=Medical+Gloves',
        productCategory: 'Medical Supplies'
      },
      {
        id: 2,
        name: 'Bandages',
        description: 'ضمادات طبية متنوعة',
        price: 8.99,
        image: 'https://placehold.co/400x300/1e88e5/ffffff?text=Bandages',
        productCategory: 'Medical Supplies'
      },
      {
        id: 3,
        name: 'First Aid Kit',
        description: 'طقم إسعافات أولية كامل',
        price: 29.99,
        image: 'https://placehold.co/400x300/1e88e5/ffffff?text=First+Aid+Kit',
        productCategory: 'Medical Supplies'
      }
    ];

    // Simulate API call
    setTimeout(() => {
      this.products = mockProducts;
      this.loading = false;
    }, 1000);

    // Commented out actual API call until backend is fixed
    /*
    this.http.get<MedicalSupply[]>('https://rxclose-api.onrender.com/api/products', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: (data) => {
        this.products = data.filter(product => 
          product.productCategory === 'Medical Supplies' || 
          product.productCategory === 'المستلزمات الطبية'
        );
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error loading medical supplies:', err);
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

  addToCart(product: MedicalSupply) {
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