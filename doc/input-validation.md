# Robust Input Validation with Zod

## 1. The Problem: Unsafe Inputs

Our application currently lacks a systematic way to validate incoming data from client requests. This means that malformed or malicious data could easily make its way into our application layer and even our domain model, causing unexpected errors or security vulnerabilities.

For example, in our `agent-profile.controller.ts`, the properties of the `body` are accessed without any validation.

```typescript
// src/infrastructure/http/controllers/agent-profile.controller.ts (Current)
// ...
  async createAgentProfile(request: FastifyRequest, reply: FastifyReply) {
    const { name, toolIds } = request.body as CreateAgentProfileBodyDto; // Unsafe type casting
    // What if 'name' is missing, not a string, or empty?
    // What if 'toolIds' is not an array of strings?
    const agentProfileId = await this.createAgentProfileUseCase.execute(name, toolIds);
    return reply.status(201).send(agentProfileId as string);
  }
// ...
```

This can lead to runtime errors deep within the application, making them hard to debug.

## 2. The Solution: Schema-Based Validation with Zod

A robust solution is to validate all incoming data at the boundary of our system (the controllers). **Zod** is a popular TypeScript-first schema declaration and validation library that is perfect for this.

With Zod, we can define a schema for our request payloads and have Zod parse and validate the data before we even pass it to our use cases.

### Example: Creating a Validation Schema

We can define a Zod schema for creating an agent profile.

```typescript
// src/infrastructure/http/schemas/agent-profile.schema.ts (Proposed)
import { z } from 'zod';

export const createAgentProfileSchema = z.object({
  name: z.string().min(1, { message: 'Name cannot be empty' }),
  toolIds: z.array(z.string().uuid({ message: 'Each tool ID must be a valid UUID' })).optional(),
});

// Type inference from the schema
export type CreateAgentProfileDto = z.infer<typeof createAgentProfileSchema>;
```

### Integrating with Fastify

We can then use this schema directly in our Fastify route definition. Fastify has built-in support for JSON Schema, and we can use `zod-to-json-schema` to convert our Zod schema.

Alternatively, for simplicity, we can perform the validation inside the controller handler.

```typescript
// src/infrastructure/http/controllers/agent-profile.controller.ts (Proposed)
import { createAgentProfileSchema, CreateAgentProfileDto } from '../schemas/agent-profile.schema';

// ...
  async createAgentProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      // 1. Validate the request body
      const { name, toolIds }: CreateAgentProfileDto = createAgentProfileSchema.parse(request.body);

      // 2. Call the use case with validated data
    const agentProfileId = await this.createAgentProfileUseCase.execute(name, toolIds);

    return reply.status(201).send(agentProfileId as string);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // 400 Bad Request if validation fails
        reply.status(400).send({
          message: 'Validation failed',
          errors: error.format(),
        });
      } else {
        // 500 for any other errors
        reply.status(500).send({ message: 'Internal Server Error' });
      }
    }
  }
// ...
```

## 3. Benefits of this Approach

- **Security**: Protects the application from a wide range of injection and malformed data attacks.
- **Robustness**: Catches errors early, right at the entry point of the system.
- **Clear Error Messages**: Provides detailed feedback to the client about what was wrong with their request.
- **Single Source of Truth**: The Zod schema becomes the single source of truth for the shape of the request data. We can even infer TypeScript types from it, eliminating type duplication.
- **Clean Application Layer**: The use cases and domain layer can now trust that the data they receive is valid, simplifying their logic.

## 4. Proposed Next Steps

1.  Add `zod` as a project dependency: `npm install zod`.
2.  Create a `src/infrastructure/http/schemas` directory to store the validation schemas.
3.  Define Zod schemas for all our DTOs (Data Transfer Objects).
4.  Refactor all controller methods to use these schemas to parse and validate incoming data.
5.  Implement centralized error handling to catch `ZodError` and return a 400 response.
