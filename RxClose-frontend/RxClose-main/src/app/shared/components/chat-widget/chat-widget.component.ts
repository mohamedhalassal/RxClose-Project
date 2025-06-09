import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, ChatMessage } from '../../services/chatbot.service';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  isAI?: boolean;
}

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.component.html',
  styleUrl: './chat-widget.component.scss'
})
export class ChatWidgetComponent {
  isOpen = false;
  messages: Message[] = [];
  newMessage: string = '';
  isLoading = false;

  // قائمة بالأعراض الشائعة وتوصياتها
  private symptomsMap: { [key: string]: string } = {
    'صداع': 'يمكن أن يكون الصداع ناتجاً عن عدة أسباب. جرب تناول باراسيتامول. إذا استمر الصداع لأكثر من يومين، يرجى استشارة الطبيب.',
    'حمى': 'إذا كانت درجة حرارتك أعلى من 38 درجة مئوية، يمكنك تناول باراسيتامول. تأكد من شرب الكثير من السوائل. إذا استمرت الحمى لأكثر من 3 أيام، استشر الطبيب.',
    'سعال': 'يمكن أن يكون السعال ناتجاً عن نزلة برد أو حساسية. جرب شراب السعال. إذا استمر لأكثر من أسبوع أو كان مصحوباً ببلغم، استشر الطبيب.',
    'ألم في الحلق': 'يمكن أن يكون التهاب الحلق. جرب الغرغرة بالماء المالح أو تناول أقراص استحلاب. إذا استمر لأكثر من 3 أيام، استشر الطبيب.',
    'غثيان': 'تجنب الأطعمة الدهنية وتناول وجبات صغيرة. إذا استمر الغثيان لأكثر من يوم أو كان مصحوباً بالقيء، استشر الطبيب.',
    'إسهال': 'اشرب الكثير من السوائل وتجنب الأطعمة الدهنية. إذا استمر لأكثر من يومين أو كان مصحوباً بالحمى، استشر الطبيب.',
    'ألم في المعدة': 'تجنب الأطعمة الحارة والدهنية. إذا استمر الألم لأكثر من يوم أو كان شديداً، استشر الطبيب.',
    'حساسية': 'تجنب المواد المسببة للحساسية وتناول مضادات الهيستامين. إذا كانت الأعراض شديدة، استشر الطبيب.',
    'أرق': 'حاول ممارسة الرياضة بانتظام وتجنب الكافيين قبل النوم. إذا استمر الأرق لأكثر من أسبوع، استشر الطبيب.',
    'توتر': 'حاول ممارسة تمارين التنفس والتأمل. إذا كان التوتر يؤثر على حياتك اليومية، استشر الطبيب.'
  };

  constructor(private chatbotService: ChatbotService) {
    // إضافة رسالة ترحيب
    this.addBotMessage('مرحباً! أنا مساعد الصيدلة الذكي المطور بتقنية الذكاء الاصطناعي. يمكنني مساعدتك في:\n\n✅ معلومات عامة عن الأدوية\n✅ نصائح للأعراض الشائعة\n✅ إرشادات صحية عامة\n\n⚠️ تذكر: استشارة الطبيب ضرورية للتشخيص الدقيق والعلاج المناسب.\n\nكيف يمكنني مساعدتك اليوم؟', true);
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      // إضافة رسالة المستخدم
      this.addUserMessage(this.newMessage);
      const userMessage = this.newMessage;
      this.newMessage = '';

      // إظهار حالة التحميل
      this.isLoading = true;

      // إرسال الرسالة إلى API
      this.chatbotService.sendMessage(userMessage).subscribe({
        next: (response: ChatMessage) => {
          // إضافة رد البوت مع معلومات الذكاء الاصطناعي
          this.addBotMessage(response.message || 'عذراً، لم أفهم سؤالك. هل يمكنك إعادة صياغته؟', response.isAI);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error sending message:', error);
          this.addBotMessage('عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى لاحقاً.');
          this.isLoading = false;
        }
      });
    }
  }

  private addUserMessage(text: string) {
    this.messages.push({
      text,
      isUser: true,
      timestamp: new Date()
    });
  }

  private addBotMessage(text: string, isAI: boolean = false) {
    this.messages.push({
      text,
      isUser: false,
      timestamp: new Date(),
      isAI: isAI
    });
  }

  // إرسال رسالة عند النقر على الأزرار السريعة
  sendQuickMessage(message: string) {
    this.newMessage = message;
    this.sendMessage();
  }
}
