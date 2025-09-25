import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private readonly http: HttpClient) {}

  // Adjust the payload/headers to match your company's API contract
  sendMessage(message: string, sessionId?: string): Observable<string> {
    const url = environment.agentApiUrl;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', ...(environment.agentApiKey ? { 'Authorization': `Bearer ${environment.agentApiKey}` } : {}) });
    const body = { message, sessionId };

    return this.http.post<{ reply: string }>(url, body, { headers }).pipe(
      map(res => res.reply)
    );
  }

  // Streaming version: consumes text/event-stream or NDJSON and yields tokens
  async streamMessage(message: string, onToken: (chunk: string) => void, sessionId?: string, signal?: AbortSignal): Promise<void> {
    const url = environment.agentApiUrl;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(environment.agentApiKey ? { 'Authorization': `Bearer ${environment.agentApiKey}` } : {}),
    };
    const body = JSON.stringify({ message, sessionId });

    const response = await fetch(url, { method: 'POST', headers, body, signal });
    if (!response.ok || !response.body) {
      throw new Error(`HTTP ${response.status}`);
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        // Handle SSE: lines starting with 'data:'
        const parts = buffer.split(/\n\n/);
        buffer = parts.pop() || '';
        for (const part of parts) {
          const lines = part.split(/\n/).map(l => l.replace(/^data:\s?/, ''));
          const payload = lines.join('\n').trim();
          if (!payload) continue;
          // Try JSON, otherwise treat as plain text token
          try {
            const obj = JSON.parse(payload);
            // Try common fields
            const token = obj.token ?? obj.delta ?? obj.content ?? obj.reply ?? '';
            if (token) onToken(String(token));
          } catch {
            onToken(payload);
          }
        }
      }
      // Flush trailing buffer
      const tail = buffer.trim();
      if (tail) {
        try {
          const obj = JSON.parse(tail);
          const token = obj.token ?? obj.delta ?? obj.content ?? obj.reply ?? '';
          if (token) onToken(String(token));
        } catch {
          onToken(tail);
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}


