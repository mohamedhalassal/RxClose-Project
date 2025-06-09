import { Component } from '@angular/core';
import { SearchInputComponent } from "../../searchpage/components/search-input/search-input.component";
import { CaregorycartComponent } from "../caregorycart/caregorycart.component";
import { RouterLink } from '@angular/router';
import { ChatWidgetComponent } from '../../../shared/components/chat-widget/chat-widget.component';

@Component({
  selector: 'app-caregorylist',
  standalone: true,
  imports: [SearchInputComponent, CaregorycartComponent, ChatWidgetComponent],
  templateUrl: './caregorylist.component.html',
  styleUrl: './caregorylist.component.scss'
})
export class CaregorylistComponent {

}
