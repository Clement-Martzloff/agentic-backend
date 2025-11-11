# Streaming Responses for Conversational Agents

## 1. The Problem: Long Wait Times for Responses

Currently, our `/conversations/:id/messages` endpoint waits for the conversational agent to fully generate a response before sending it back to the client. For complex queries or agents that perform multiple steps (e.g., tool use), this can lead to a long delay and a poor user experience. The user is left waiting with no feedback.

```
Client --- (POST /messages) ---> Server
  |                                  |
  (waits...)                         (Agent processes...)
  (waits...)                         (Agent calls a tool...)
  (waits...)                         (Agent generates final answer...)
  |                                  |
  <-- (200 OK with full response) -- Server
```

This synchronous, "all-or-nothing" approach is not ideal for conversational AI.

## 2. The Solution: Streaming Responses

A much better approach is to **stream** the response back to the client as it's being generated. This provides immediate feedback and makes the application feel much more responsive.

The flow would look like this:
1.  The client sends a message.
2.  The server immediately opens a streaming connection back to the client.
3.  As the agent generates tokens of text or takes actions, it sends these intermediate results down the stream.
4.  The client UI can render these tokens or status updates in real-time.

```
Client --- (POST /messages) ---> Server
  |                                  |
  <-- (Connection opens, headers) ---
  <-- "Thinking..." ----------------
  <-- "Calling weather tool..." ----
  <-- "The" ------------------------
  <-- "weather" --------------------
  <-- "in" -------------------------
  <-- "Paris..." -------------------
  <-- (Stream closes) --------------
```

### How to Implement Streaming in our Architecture

This can be achieved by making a few key changes to our application.

#### 1. Update the `ConversationalAgentService`

The service interface needs to be updated to support streaming. Instead of returning a `Promise<string>`, it could return an `AsyncIterable<string>` or a similar streamable type.

```typescript
// src/domain/services/conversational-agent.service.ts (Proposed)
export interface ConversationalAgentService {
  sendMessage(
    conversationId: string,
    message: string,
  ): Promise<string>; // Existing method

  sendMessageStream(
    conversationId: string,
    message: string,
  ): AsyncIterable<string | AgentAction>; // New streaming method
}

// We can define a type for intermediate steps
export type AgentAction = { type: 'tool_call', toolName: string, toolInput: any };
```

#### 2. Update the `SendMessageUseCase`

A new use case, `SendMessageStreamUseCase`, would be created to handle the streaming logic. It would call the new service method and return the stream.

```typescript
// src/application/usecases/conversations/send-message-stream.usecase.ts (Proposed)
// ...
export class SendMessageStreamUseCase {
  // ...
  async *execute(conversationId: string, message: string) {
    const agentService = await this.agentServiceFactory.create(conversationId);
    yield* agentService.sendMessageStream(conversationId, message);
  }
}
```

#### 3. Create a New Streaming Route in Fastify

Fastify supports streaming out of the box. We can create a new route that calls our new use case and pipes the resulting stream directly to the HTTP response.

```typescript
// src/infrastructure/http/routes/conversation.route.ts (Proposed)
// ...
  fastify.post(
    '/conversations/:id/messages/stream',
    async function (req: FastifyRequest, reply: FastifyReply) {
      // ... (validation)

      const useCase = container.resolve<SendMessageStreamUseCase>('sendMessageStreamUseCase');
      const stream = useCase.execute(id, message);

      // Set headers for Server-Sent Events (SSE)
      reply.raw.setHeader('Content-Type', 'text/event-stream');
      reply.raw.setHeader('Connection', 'keep-alive');
      reply.raw.setHeader('Cache-Control', 'no-cache');

      for await (const chunk of stream) {
        let data: string;
        if (typeof chunk === 'string') {
          data = JSON.stringify({ type: 'token', value: chunk });
        } else {
          data = JSON.stringify({ type: 'action', value: chunk });
        }
        reply.raw.write(`data: ${data}\n\n`);
      }

      reply.raw.end();
    }
  );
// ...
```

## 3. Benefits of this Approach

- **Vastly Improved User Experience**: The application feels faster and more interactive.
- **Real-time Feedback**: Users can see that the agent is working, including what tools it's using.
- **Efficiency**: The client can start processing the response immediately instead of waiting for the full payload.
- **Standard Technology**: Using Server-Sent Events (SSE) is a well-established web standard for this type of one-way streaming.

## 4. Proposed Next Steps

1.  Update the `ConversationalAgentService` interface to include a streaming method.
2.  Modify the underlying agent implementation (e.g., LangGraph) to support streaming generation. Most modern LLM SDKs support this.
3.  Create a new `SendMessageStreamUseCase`.
4.  Add a new streaming route to `conversation.route.ts` that uses SSE.
5.  Update the dependency injection container to register the new use case.

```