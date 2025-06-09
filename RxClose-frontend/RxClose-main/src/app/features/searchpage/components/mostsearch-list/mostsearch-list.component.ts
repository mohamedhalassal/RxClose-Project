import { Component } from '@angular/core';
import { SearchInputComponent } from "../search-input/search-input.component";
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-mostsearch-list',
  imports: [SearchInputComponent,RouterLink],
  templateUrl: './mostsearch-list.component.html',
  styleUrl: './mostsearch-list.component.scss'
})
export class MostsearchListComponent {
  constructor(
    private _AuthService: AuthService,
    private _Router: Router
  ) {}

  logout() {
    this._AuthService.logout();
    this._Router.navigate(['/auth/login']);
  }
}
