import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container">
      <div class="map-header" *ngIf="showHeader">
        <h3>{{ title }}</h3>
        <p>{{ subtitle }}</p>
      </div>
      <div #mapElement [id]="mapId" class="map"></div>
      <div class="map-info" *ngIf="selectedLocation">
        <p><strong>Selected Location:</strong></p>
        <p>Latitude: {{ selectedLocation.latitude | number:'1.6-6' }}</p>
        <p>Longitude: {{ selectedLocation.longitude | number:'1.6-6' }}</p>
      </div>
    </div>
  `,
  styles: [`
    .map-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      margin: 1rem 0;
    }

    .map-header {
      padding: 1rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }

    .map-header h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .map-header p {
      margin: 0;
      opacity: 0.9;
      font-size: 0.9rem;
    }

    .map {
      height: 400px;
      width: 100%;
      position: relative;
      z-index: 1;
    }

    .map-info {
      padding: 1rem;
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
    }

    .map-info p {
      margin: 0.25rem 0;
      font-size: 0.9rem;
    }

    .map-info strong {
      color: #495057;
    }
  `]
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild('mapElement', { static: true }) mapElement!: ElementRef;
  
  @Input() title: string = 'Select Location';
  @Input() subtitle: string = 'Click on the map to select your location';
  @Input() showHeader: boolean = true;
  @Input() initialLatitude?: number;
  @Input() initialLongitude?: number;
  @Input() enableLocationSelection: boolean = true;
  @Input() height: string = '400px';
  
  @Output() locationSelected = new EventEmitter<{latitude: number, longitude: number}>();
  
  mapId: string = '';
  private map!: L.Map;
  private marker?: L.Marker;
  selectedLocation?: {latitude: number, longitude: number};

  ngOnInit() {
    this.mapId = 'map-' + Math.random().toString(36).substr(2, 9);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initializeMap();
    }, 100);
  }

  private initializeMap() {
    // Default to Cairo, Egypt if no initial coordinates
    const defaultLat = this.initialLatitude || 30.0444;
    const defaultLng = this.initialLongitude || 31.2357;

    // Initialize map
    this.map = L.map(this.mapId).setView([defaultLat, defaultLng], 13);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Set custom marker icon
    const customIcon = L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Add initial marker if coordinates provided
    if (this.initialLatitude && this.initialLongitude) {
      this.addMarker(this.initialLatitude, this.initialLongitude);
    }

    // Add click event listener for location selection
    if (this.enableLocationSelection) {
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        this.addMarker(lat, lng);
        this.selectedLocation = { latitude: lat, longitude: lng };
        this.locationSelected.emit(this.selectedLocation);
      });
    }

    // Try to get user's current location
    this.getCurrentLocation();
  }

  private addMarker(lat: number, lng: number) {
    // Remove existing marker
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    // Add new marker
    const customIcon = L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    this.marker = L.marker([lat, lng], { icon: customIcon })
      .addTo(this.map)
      .bindPopup(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      .openPopup();
  }

  private getCurrentLocation() {
    if (navigator.geolocation && !this.initialLatitude) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.map.setView([lat, lng], 15);
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  }

  // Public method to set location programmatically
  setLocation(latitude: number, longitude: number) {
    this.selectedLocation = { latitude, longitude };
    this.addMarker(latitude, longitude);
    this.map.setView([latitude, longitude], 15);
  }

  // Public method to get current selected location
  getSelectedLocation() {
    return this.selectedLocation;
  }
} 