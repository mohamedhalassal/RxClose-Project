import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CartService } from '../../../shared/services/cart.service';

interface HomeCareProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  productCategory: string;
}

@Component({
  selector: 'app-home-care',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './home-care.component.html',
  styleUrls: ['./home-care.component.scss']
})
export class HomeCareComponent implements OnInit {
  products: HomeCareProduct[] = [];
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
    const mockProducts: HomeCareProduct[] = [
      {
        id: 1,
        name: 'First Aid Kit',
        description: 'طقم إسعافات أولية منزلي كامل',
        price: 49.99,
        image: 'https://placehold.co/400x300/1e88e5/ffffff?text=First+Aid+Kit',
        productCategory: 'Home Care'
      },
      {
        id: 2,
        name: 'Digital Thermometer',
        description: 'ميزان حرارة رقمي دقيق',
        price: 19.99,
        image: 'https://placehold.co/400x300/1e88e5/ffffff?text=Digital+Thermometer',
        productCategory: 'Home Care'
      },
      {
        id: 3,
        name: 'Blood Pressure Monitor',
        description: 'جهاز قياس ضغط الدم الرقمي',
        price: 89.99,
        image: 'https://placehold.co/400x300/1e88e5/ffffff?text=BP+Monitor',
        productCategory: 'Home Care'
      }
    ];

    // Simulate API call
    setTimeout(() => {
      this.products = mockProducts;
      this.loading = false;
    }, 1000);

    // Commented out actual API call until backend is fixed
    /*
    this.http.get<HomeCareProduct[]>('https://rxclose-api.onrender.com/api/products', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: (data) => {
        this.products = data.filter(product => 
          product.productCategory === 'Home Care' || 
          product.productCategory === 'العناية بالمنزل'
        );
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error loading home care products:', err);
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

  addToCart(product: HomeCareProduct) {
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