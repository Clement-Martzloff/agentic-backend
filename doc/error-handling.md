# A Robust Custom Error Handling System

## 1. The Problem: Generic and Uninformative Errors

Currently, our application's error handling is inconsistent. Some errors are caught, but many are not, leading to generic `500 Internal Server Error` responses. When an error does occur, we lack the context to know *where* it happened (domain logic, database, external API?) and *why*.

This makes debugging difficult and prevents us from providing meaningful HTTP responses to the client. For example, a "not found" error in the database should result in a `404 Not Found`, not a `500`.

## 2. The Solution: A Hierarchy of Custom Errors

To solve this, we can implement a custom error hierarchy that reflects the layers of our application architecture. This allows us to throw errors with specific context and handle them appropriately at the HTTP layer.

We can define a base `AppError` class and then extend it for each layer:

- **`DomainError`**: For errors related to business rule violations (e.g., an invalid state transition).
- **`ApplicationError`**: For errors in the application/use case layer (e.g., orchestrating a task that fails).
- **`InfrastructureError`**: For errors from external systems like databases, caches, or APIs.

### Example: Custom Error Classes

```typescript
// src/domain/errors/app.error.ts (Proposed)
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// src/domain/errors/domain.error.ts (Proposed)
export class DomainError extends AppError {}

// src/application/errors/application.error.ts (Proposed)
export class ApplicationError extends AppError {}

// src/infrastructure/errors/infrastructure.error.ts (Proposed)
export class InfrastructureError extends AppError {}

// A more specific error
// src/application/errors/not-found.error.ts (Proposed)
export class NotFoundError extends ApplicationError {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found.`);
  }
}
```

### How to Use Them

Our code can now throw these specific errors.

```typescript
// src/application/usecases/agent-profiles/get-agent-profile.usecase.ts (Proposed)
// ...
  async execute(id: string): Promise<AgentProfileEntity> {
    const agentProfile = await this.agentProfileRepository.findById(id);

    if (!agentProfile) {
      // Throw a specific "NotFound" error
      throw new NotFoundError('AgentProfile', id);
    }

    return agentProfile;
  }
// ...
```

### Centralized Error Handling in Fastify

Finally, we can create a centralized error handler in Fastify to map these custom errors to the correct HTTP status codes.

```typescript
// src/infrastructure/http/fastify-server.ts (Proposed)
import { FastifyInstance } from 'fastify';
import { AppError } from '../../domain/errors/app.error';
import { NotFoundError } from '../../application/errors/not-found.error';
import { ZodError } from 'zod';

export function setupErrorHandler(server: FastifyInstance) {
  server.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        message: 'Validation Error',
        errors: error.format(),
      });
    }

    if (error instanceof NotFoundError) {
      return reply.status(404).send({ message: error.message });
    }

    if (error instanceof AppError) {
      // Catch our custom errors
      return reply.status(400).send({ message: error.message });
    }

    // Log the unexpected error
    request.log.error(error);

    // Fallback to a generic 500 error
    reply.status(500).send({ message: 'An unexpected internal server error occurred.' });
  });
}

// Then in the main server setup:
// const server = Fastify(...);
// setupErrorHandler(server);
```

## 3. Benefits of this Approach

- **Clarity and Context**: We immediately know the nature and origin of an error.
- **Correct HTTP Responses**: We can easily map domain and application errors to appropriate HTTP status codes (`404`, `400`, `409`, etc.).
- **Improved Debugging**: Logs become more meaningful when they contain specific error types.
- **Decoupling**: The domain and application layers don't need to know about HTTP. They just throw the right type of error.

## 4. Proposed Next Steps

1.  Create a `src/domain/errors` directory (and similar for other layers) for the custom error classes.
2.  Implement the base `AppError` and the specialized error classes (`DomainError`, `NotFoundError`, etc.).
3.  Refactor the use cases and repositories to throw these custom errors instead of generic `Error`s.
4.  Implement a centralized error handler in `fastify-server.ts` to handle these errors and send the correct HTTP responses.
