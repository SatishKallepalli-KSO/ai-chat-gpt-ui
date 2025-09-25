# AI Chat GPT UI (Sample)

Minimal Angular sample that calls an external AI agent API and renders a chat UI.

## Configure

Set your agent API endpoint in environment files:

- Development: `src/environments/environment.development.ts` → `agentApiUrl`
- Production: `src/environments/environment.ts` → `agentApiUrl`

The service sends `{ message, sessionId }` and expects `{ reply: string }`.

## Run

```bash
npm install
npm start
# open http://localhost:4200
```

## Where to change things

- API call: `src/app/services/chat.service.ts`
- Chat logic: `src/app/components/chat/chat.component.ts`
- Chat UI: `src/app/components/chat/chat.component.html|css`

## Notes

- If your API needs auth headers, add them in `ChatService` where `HttpHeaders` are set.
- For streaming responses, switch to `observe: 'events'` or server-sent events/websocket and update the component to append partial tokens.
