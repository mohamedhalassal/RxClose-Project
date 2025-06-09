import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../../shared/services/cart.service';

interface FitnessProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  productCategory: string;
}

@Component({
  selector: 'app-fitness-nutrition',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './fitness-nutrition.component.html',
  styleUrls: ['./fitness-nutrition.component.scss']
})
export class FitnessNutritionComponent implements OnInit {
  products: FitnessProduct[] = [];
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

    this.http.get<FitnessProduct[]>('https://rxclose-api.onrender.com/api/products')
      .subscribe({
        next: (data) => {
          // تصفية المنتجات للحصول على منتجات اللياقة والتغذية فقط
          this.products = data.filter(product => 
            product.productCategory === 'Fitness & Nutrition' || 
            product.productCategory === 'اللياقة والتغذية'
          );
          this.loading = false;
        },
        error: (err) => {
          this.error = 'حدث خطأ أثناء تحميل المنتجات';
          this.loading = false;
          console.error('Error loading products:', err);
        }
      });
  }

  addToCart(product: FitnessProduct) {
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