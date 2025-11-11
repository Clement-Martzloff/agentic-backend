# 🧭 Authentication, Authorization & Multi-Tenancy Architecture

## 1. Context

This project uses **Fastify** with a **Ports & Adapters (Hexagonal)** architecture to manage **LLM agents**, **agent profiles**, **tools**, and **conversations**.

Currently, the system runs in a single-tenant mode with no user or organization boundaries.  
Adding authentication, authorization, and multi-tenancy introduces **identity**, **ownership**, **access scope**, and **context propagation** — especially relevant when **LLM agents act on behalf of users or organizations**.

---

## 2. Objectives

- ✅ Provide **user authentication** (e.g. Clerk).
- ✅ Support **multi-tenancy**: organizations own agents, tools, and conversations.
- ✅ Implement **authorization (RBAC)** to restrict actions based on role and organization.
- ✅ Maintain clean **ports/adapters separation** with no vendor lock-in.
- ✅ Allow **authorization context** (user/org/role) to propagate down to **LLM adapters** and tools.

---

## 3. Conceptual Model

| Entity           | Description                                         | Relationships                                            |
| ---------------- | --------------------------------------------------- | -------------------------------------------------------- |
| **User**         | Authenticated identity (from Clerk or internal DB). | Belongs to one or more `Organization`s via `Membership`. |
| **Organization** | Tenant boundary. Owns data.                         | Owns `AgentProfiles`, `Tools`, and `Conversations`.      |
| **Membership**   | Links `User` ↔ `Organization` with a `role`.       | Defines permissions (admin, member, viewer, etc.).       |
| **AgentProfile** | Defines configuration for an LLM agent.             | Belongs to an `Organization`.                            |
| **Tool**         | Executable capability used by agents.               | May belong to or be shared across orgs.                  |
| **Conversation** | Interaction between a user and an agent.            | Belongs to one `Organization`.                           |

---

## 4. Key Design Questions (to be clarified before implementation)

| Topic                | Key Question                                                  | Design Impact                                    |
| -------------------- | ------------------------------------------------------------- | ------------------------------------------------ |
| **Tenancy model**    | Should an agent/tool belong to only one org, or be shareable? | Affects schema and repository filters.           |
| **Membership**       | Can a user belong to multiple orgs?                           | Defines how org context is resolved per request. |
| **Role hierarchy**   | Do we need granular roles or simple admin/member/viewer?      | Influences middleware and policy logic.          |
| **Cross-org access** | Should admins access data from other orgs?                    | Decides whether orgId is required in URLs.       |
| **LLM context**      | Should the LLM receive user/org info for tool invocation?     | Affects prompt and adapter structure.            |
| **Auth provider**    | Is Clerk the source of truth for orgs/memberships?            | Impacts DB schema and sync logic.                |

These decisions must be made **before implementing migrations or policies**.

---

## 5. Proposed Architecture (Placeholder-Ready)

### Infrastructure Layer

- **`AuthService`**:
  - Validates token.
  - Returns `AuthUser` → `{ id, email, orgId, roles }`.

- **`authorize()` Middleware**:
  - Extracts user/org context from request.
  - Attaches `request.user` for downstream use.
  - Enforces required roles (e.g. `admin`, `member`).

- **Fastify Routes**:
  - Updated to `/orgs/:orgId/...` for explicit multi-tenant context.
  - Example:
    ```ts
    fastify.post('/orgs/:orgId/conversations', { preHandler: [authorize()] }, handler);
    ```

### Application Layer

- Use cases (`SendMessageUseCase`, `StartConversationUseCase`, etc.) now accept:
  ```ts
  async execute(conversationId: string, message: string, user: AuthUser)
  ```
