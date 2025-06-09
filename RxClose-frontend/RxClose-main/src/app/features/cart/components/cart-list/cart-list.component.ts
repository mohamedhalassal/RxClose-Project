import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { CartItemComponent } from '../cart-item/cart-item.component';
import { CartSimilarsingsComponent } from '../cart-similarsings/cart-similarsings.component';

@Component({
  selector: 'app-cart-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, CartItemComponent, CartSimilarsingsComponent],
  templateUrl: './cart-list.component.html',
  styleUrls: ['./cart-list.component.scss']
})
export class CartListComponent implements OnInit {

  ngOnInit(): void {
    // ... rest of the component code ...
  }
}
