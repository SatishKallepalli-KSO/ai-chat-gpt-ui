import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  userInput = '';
  isSending = false;
  sessionId?: string;
  messages: Array<{ role: 'user' | 'agent'; content: string; html?: string }> = [
    { role: 'agent', content: 'Hello! Ask me anything.', html: ChatComponent.render('Hello! Ask me anything.') }
  ];
  private abortController?: AbortController;
  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLDivElement>;

  constructor(private readonly chatService: ChatService) {}

  async onSend(): Promise<void> {
    const trimmed = this.userInput.trim();
    if (!trimmed || this.isSending) return;

    this.messages.push({ role: 'user', content: trimmed, html: ChatComponent.render(trimmed) });
    this.userInput = '';
    this.isSending = true;

    // Streaming path
    const currentIndex = this.messages.push({ role: 'agent', content: '', html: '' }) - 1;
    this.scrollToBottomSoon();
    this.abortController = new AbortController();
    try {
      await this.chatService.streamMessage(
        trimmed,
        (chunk) => {
          const current = this.messages[currentIndex];
          current.content += chunk;
          current.html = ChatComponent.render(current.content);
          this.scrollToBottomSoon();
        },
        this.sessionId,
        this.abortController.signal
      );
    } catch (err) {
      this.messages[currentIndex].content = 'Sorry, something went wrong.';
      this.messages[currentIndex].html = ChatComponent.render(this.messages[currentIndex].content);
    } finally {
      this.isSending = false;
      this.abortController = undefined;
    }
  }

  stop(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = undefined;
      this.isSending = false;
    }
  }

  clear(): void {
    this.messages = [];
  }

  autoGrow(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = Math.min(200, el.scrollHeight) + 'px';
  }

  private scrollToBottomSoon(): void {
    setTimeout(() => {
      const scroller = this.scrollContainer?.nativeElement;
      if (scroller) scroller.scrollTop = scroller.scrollHeight;
    }, 0);
  }

  private static render(text: string): string {
    const raw = marked.parse(text) as string;
    return DOMPurify.sanitize(raw);
  }
}


