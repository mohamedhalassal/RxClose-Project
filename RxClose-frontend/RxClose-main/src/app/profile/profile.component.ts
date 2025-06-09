import { Component } from '@angular/core';
import { ChatWidgetComponent } from '../shared/components/chat-widget/chat-widget.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ChatWidgetComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {

}
