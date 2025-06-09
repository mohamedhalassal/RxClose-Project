import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
  message: string;
  isAI: boolean;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = 'http://localhost:5000/api/chatbot';

  constructor(private http: HttpClient) { }

  sendMessage(message: string, userId?: string): Observable<ChatMessage> {
    const payload = {
      message: message,
      userId: userId
    };
    
    return this.http.post<ChatMessage>(`${this.apiUrl}/message`, payload);
  }
} 