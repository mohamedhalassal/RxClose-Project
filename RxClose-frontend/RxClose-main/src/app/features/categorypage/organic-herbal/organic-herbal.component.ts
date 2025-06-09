import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CartService } from '../../../shared/services/cart.service';

interface OrganicProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  productCategory: string;
}

@Component({
  selector: 'app-organic-herbal',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './organic-herbal.component.html',
  styleUrls: ['./organic-herbal.component.scss']
})
export class OrganicHerbalComponent implements OnInit {
  products: OrganicProduct[] = [];
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
    const mockProducts: OrganicProduct[] = [
      {
        id: 1,
        name: 'Organic Green Tea',
        description: 'شاي أخضر عضوي طبيعي',
        price: 15.99,
        image: 'https://placehold.co/400x300/1e88e5/ffffff?text=Green+Tea',
        productCategory: 'Organic & Herbal'
      },
      {
        id: 2,
        name: 'Herbal Sleep Aid',
        description: 'مكمل عشبي للمساعدة على النوم',
        price: 24.99,
        image: 'https://placehold.co/400x300/1e88e5/ffffff?text=Sleep+Aid',
        productCategory: 'Organic & Herbal'
      },
      {
        id: 3,
        name: 'Organic Honey',
        description: 'عسل طبيعي عضوي',
        price: 29.99,
        image: 'https://placehold.co/400x300/1e88e5/ffffff?text=Organic+Honey',
        productCategory: 'Organic & Herbal'
      }
    ];

    // Simulate API call
    setTimeout(() => {
      this.products = mockProducts;
      this.loading = false;
    }, 1000);

    // Commented out actual API call until backend is fixed
    /*
    this.http.get<OrganicProduct[]>('https://rxclose-api.onrender.com/api/products')
      .subscribe({
        next: (data) => {
          this.products = data.filter(product => 
            product.productCategory === 'Organic & Herbal' || 
            product.productCategory === 'منتجات عضوية وأعشاب'
          );
          this.loading = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error loading organic products:', err);
          this.error = 'حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة أخرى لاحقاً.';
          this.loading = false;
        }
      });
    */
  }

  addToCart(product: OrganicProduct) {
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