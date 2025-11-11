# Enhancing the Domain Model with Value Objects

## 1. The Problem: Primitive Obsession

Currently, our entities use primitive types (like `string`, `number`) for their properties.

```typescript
// src/domain/entities/agent-profile.entity.ts (Current)
export class AgentProfileEntity {
  id: string;
  name: string;
  description: string;
  // ...
}
```

This approach, known as **Primitive Obsession**, has several drawbacks:
- **Lack of Type Safety**: A `string` `id` is interchangeable with a `string` `name`, but they represent different concepts. You could accidentally pass a name where an ID is expected.
- **Validation Logic is Scattered**: Validation rules (e.g., "an ID must be a UUID", "a name cannot be empty") are spread across use cases, controllers, or are missing entirely.
- **Implicit Concepts**: The meaning of a property is just in its name. The business rules are not captured in the code itself.

## 2. The Solution: Value Objects

A **Value Object** is an object that represents a concept from the domain. Its identity is based on its value, not on a unique ID. They are immutable.

By wrapping primitives in Value Objects, we can embed validation and business logic directly into the domain model.

### Example: Creating a `AgentProfileId` Value Object

Instead of `id: string`, we can create a `AgentProfileId` class.

```typescript
// src/domain/value-objects/agent-profile-id.vo.ts (Proposed)
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

export class AgentProfileId {
  private readonly _value: string;

  private constructor(value: string) {
    if (!uuidValidate(value)) {
      throw new Error('Invalid Agent Profile ID: Must be a valid UUID.');
    }
    this._value = value;
  }

  static create(value?: string): AgentProfileId {
    return new AgentProfileId(value || uuidv4());
  }

  get value(): string {
    return this._value;
  }

  equals(other: AgentProfileId): boolean {
    return this._value === other.value;
  }
}
```

### How to Use It

The `AgentProfileEntity` would be updated to use this Value Object.

```typescript
// src/domain/entities/agent-profile.entity.ts (Proposed)
import { AgentProfileId } from '../value-objects/agent-profile-id.vo';
import { AgentProfileName } from '../value-objects/agent-profile-name.vo';

export class AgentProfileEntity {
  id: AgentProfileId;
  name: AgentProfileName;
  description: string; // Could also be a Value Object

  constructor(props: { id: AgentProfileId; name: AgentProfileName; description: string }) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
  }

  // Factory method for creation
  static create(props: { name: string; description:string; id?: string }): AgentProfileEntity {
    const agentProfileId = AgentProfileId.create(props.id);
    const agentProfileName = AgentProfileName.create(props.name);

    return new AgentProfileEntity({
      id: agentProfileId,
      name: agentProfileName,
      description: props.description,
    });
  }
}
```

## 3. Benefits of this Approach

- **Strong Typing**: You can no longer accidentally mix up a `name` and an `id`. The TypeScript compiler will catch these errors.
- **Centralized Validation**: Validation logic is in one place—the Value Object's constructor or factory method.
- **Richer Domain Model**: The code now better expresses the business concepts. `AgentProfileId` is more meaningful than `string`.
- **Immutability**: Value Objects are immutable, which prevents unintended side effects and makes state management more predictable.

## 4. Proposed Next Steps

1.  Create a `src/domain/value-objects` directory.
2.  Identify properties in our entities that represent core domain concepts (`id`, `name`, `email`, etc.).
3.  Create Value Object classes for these concepts.
4.  Refactor the entities to use these new Value Objects.
5.  Update repositories and use cases to work with the refactored entities.
