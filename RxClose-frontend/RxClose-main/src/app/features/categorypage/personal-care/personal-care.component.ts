import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CartService } from '../../../shared/services/cart.service';

interface PersonalCareProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  productCategory: string;
}

@Component({
  selector: 'app-personal-care',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './personal-care.component.html',
  styleUrls: ['./personal-care.component.scss']
})
export class PersonalCareComponent implements OnInit {
  products: PersonalCareProduct[] = [];
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
    const mockProducts: PersonalCareProduct[] = [
      {
        id: 1,
        name: 'Facial Cleanser',
        description: 'غسول وجه لطيف للبشرة الحساسة',
        price: 24.99,
        image: 'https://placehold.co/400x300/1e88e5/ffffff?text=Facial+Cleanser',
        productCategory: 'Personal Care'
      },
      {
        id: 2,
        name: 'Body Lotion',
        description: 'مرطب للجسم مع فيتامين E',
        price: 19.99,
        image: 'https://placehold.co/400x300/1e88e5/ffffff?text=Body+Lotion',
        productCategory: 'Personal Care'
      },
      {
        id: 3,
        name: 'Shampoo',
        description: 'شامبو للشعر الجاف والمتضرر',
        price: 15.99,
        image: 'https://placehold.co/400x300/1e88e5/ffffff?text=Shampoo',
        productCategory: 'Personal Care'
      }
    ];

    // Simulate API call
    setTimeout(() => {
      this.products = mockProducts;
      this.loading = false;
    }, 1000);

    // Commented out actual API call until backend is fixed
    /*
    this.http.get<PersonalCareProduct[]>('https://rxclose-api.onrender.com/api/products', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: (data) => {
        this.products = data.filter(product => 
          product.productCategory === 'Personal Care' || 
          product.productCategory === 'العناية الشخصية'
        );
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error loading personal care products:', err);
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

  addToCart(product: PersonalCareProduct) {
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