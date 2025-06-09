import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { ChatWidgetComponent } from '../../shared/components/chat-widget/chat-widget.component';

interface Pharmacy {
  id: number;
  name: string;
  address: string;
  phone: string;
  distance?: number;
  medicineAvailable: boolean;
}

interface SearchResult {
  medicine: {
    id: number;
    name: string;
    description: string;
    price: number;
    image?: string;
  };
  pharmacies: Pharmacy[];
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, ChatWidgetComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchQuery: string = '';
  searchResults: SearchResult | null = null;
  loading: boolean = false;
  error: string | null = null;
  noResults: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    // Initialize component
    console.log('Search component initialized');
  }

  searchMedicine() {
    if (!this.searchQuery.trim()) {
      this.error = 'الرجاء إدخال اسم الدواء';
      return;
    }

    this.loading = true;
    this.error = null;
    this.noResults = false;
    this.searchResults = null;

    // Using mock data temporarily until API is fixed
    setTimeout(() => {
      const mockResults: SearchResult = {
        medicine: {
          id: 1,
          name: this.searchQuery,
          description: 'وصف الدواء',
          price: 25.99,
          image: 'https://placehold.co/400x300/1e88e5/ffffff?text=Medicine'
        },
        pharmacies: [
          {
            id: 1,
            name: 'صيدلية الحياة',
            address: 'شارع النصر، القاهرة',
            phone: '0123456789',
            distance: 2.5,
            medicineAvailable: true
          },
          {
            id: 2,
            name: 'صيدلية الشفاء',
            address: 'شارع السلام، القاهرة',
            phone: '0123456788',
            distance: 3.1,
            medicineAvailable: true
          }
        ]
      };

      this.searchResults = mockResults;
      this.loading = false;
      this.noResults = this.searchResults.pharmacies.length === 0;
    }, 1000);

    // Commented out actual API call until backend is fixed
    /*
    this.http.get<SearchResult>(`https://rxclose-api.onrender.com/api/search?medicine=${this.searchQuery}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: (data) => {
        this.searchResults = data;
        this.loading = false;
        this.noResults = this.searchResults.pharmacies.length === 0;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error searching for medicine:', err);
        if (err.status === 0) {
          this.error = 'لا يمكن الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.';
        } else if (err.status === 400) {
          this.error = 'طلب غير صالح. يرجى المحاولة مرة أخرى.';
        } else if (err.status === 404) {
          this.error = 'لم يتم العثور على الدواء. يرجى التحقق من الاسم والمحاولة مرة أخرى.';
        } else {
          this.error = 'حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى لاحقاً.';
        }
        this.loading = false;
      }
    });
    */
  }

  getDirections(pharmacy: Pharmacy) {
    // Implement directions functionality
    console.log('Getting directions to:', pharmacy.name);
  }

  callPharmacy(phone: string) {
    window.location.href = `tel:${phone}`;
  }
} 