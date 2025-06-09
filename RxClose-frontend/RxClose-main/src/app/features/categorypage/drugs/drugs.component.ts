import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../../shared/services/cart.service';

interface Medicine {
  id: number;
  name: string;
  price: number;
  description: string;
  image?: string;
}

@Component({
  selector: 'app-drugs',
  templateUrl: './drugs.component.html',
  standalone: true,
  imports: [RouterModule, CommonModule]
})
export class DrugsComponent implements OnInit {
  medicines: Medicine[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private _Router: Router,
    private _AuthService: AuthService,
    private http: HttpClient,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.loadMedicines();
  }

  loadMedicines() {
    this.loading = true;
    this.http.get<Medicine[]>('/api/medicines').subscribe({
      next: (data) => {
        this.medicines = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'حدث خطأ أثناء تحميل المنتجات';
        this.loading = false;
        console.error('Error loading medicines:', error);
      }
    });
  }

  addToCart(medicine: Medicine) {
    this.cartService.addToCart({
      id: medicine.id,
      name: medicine.name,
      price: medicine.price,
      quantity: 1,
      image: medicine.image
    });
  }

  logout() {
    this._AuthService.logout();
    this._Router.navigate(['/signin']);
  }
} 