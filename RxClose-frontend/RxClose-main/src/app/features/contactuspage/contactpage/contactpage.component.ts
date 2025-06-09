import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { ChatWidgetComponent } from '../../../shared/components/chat-widget/chat-widget.component';

@Component({
  selector: 'app-contactpage',
  templateUrl: './contactpage.component.html',
  styleUrls: ['./contactpage.component.scss'],
  standalone: true,
  imports: [RouterModule, ChatWidgetComponent]
})
export class ContactpageComponent {
  constructor(
    private _Router: Router,
    private _AuthService: AuthService
  ) {}

  logout() {
    this._AuthService.logout();
    this._Router.navigate(['/auth/login']);
  }
}
