# Agentic Backend

This is a TypeScript/Node.js-based web application designed to provide a minimal yet robust agentic backend. It focuses on managing AI agents, enabling conversational interactions, and integrating with OpenAI and LangGraph.

The core technologies are **TypeScript/Node.js** with **Fastify** for the backend, **OpenAI SDK** for AI integration, **LangGraph (JS)** for agent orchestration, **PostgreSQL** for the database, and **Docker** for containerization.

## Features

- **Agent Profile Management**: Perform full CRUD (Create, Read, Update, Delete) operations on agent profiles. Each profile defines an agent's characteristics, including its name, description, and the set of tools it can use.
- **Conversational Interaction**: Start new conversations with a specific agent profile and send messages to it.
- **Tool Integration**: Agents can be equipped with tools (e.g., a weather forecast tool) that they can decide to use to answer user queries.
- **Extensibility**: The architecture is designed to be extensible. You can easily create new tools, agents, and use cases to enhance the system's capabilities.

## Core Concepts

The project follows a Domain-Driven Design (DDD) approach, with the core domain separated into entities, repositories, services, and factories.

### Domain Layer

The `domain` layer contains the core business logic of the application.

#### Entities

- **AgentProfileEntity**: Represents a configurable conversational agent. Each agent profile has a set of tools it can use.
- **ToolEntity**: Represents a capability that can be used by an Agent Profile.
- **ConversationEntity**: Represents a conversation with an agent, linked to a specific agent profile.

### Application Layer

The `application` layer contains the use cases of the application, such as `SendMessageUseCase` and `StartConversationUseCase`.

### Infrastructure Layer

The `infrastructure` layer contains the concrete implementations of the interfaces defined in the `domain` layer, including repositories, conversational agent services, and HTTP controllers.

## Configuration

Before running the application, you need to set up your environment variables. Copy the `.env.template` file to a new file named `.env` and fill in the required values.

```bash
cp .env.template .env
```

The following variables are required:

- `DATABASE_URL`: The full connection URL for the PostgreSQL database.
- `POSTGRES_DB`: The name of the database.
- `POSTGRES_USER`: The username for the database.
- `POSTGRES_PASSWORD`: The password for the database user.
- `OPENAI_API_KEY`: Your API key for OpenAI, used by the conversational agents.

see: [`.env.template`](./.env.template) for more details on each variable.

## Building and Running

The PostgreSQL database is containerized and managed via Docker Compose. The Node.js application runs directly using npm scripts.

### Local Development

For local development, ensure Node.js (v20 or higher) and Docker are installed.

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Start PostgreSQL Container**:
    ```bash
    docker-compose up -d db
    ```
3.  **Run the Application**:
    ```bash
    npm run dev
    ```
    The backend will typically be available at `http://localhost:3000`.

### Stopping the Application

To stop the PostgreSQL service:

```bash
docker-compose down
```

## API Documentation

Once the application is running, the API documentation, powered by Swagger UI, can be accessed at:

```
http://localhost:3000/doc
```

This interface allows you to explore available endpoints, understand request/response schemas, and test API calls directly from your browser.

## Useful Database Queries

You can execute queries directly on the PostgreSQL container to inspect the state of the database.

**Note**: The container name is specified by the `docker-compose.yml` file. It is `db` in the commands below, but if you have multiple projects running, it might be prefixed (e.g., `agentic-backend-db-1`). Use `docker ps` to find the correct container name.

- **List all tables**:

  ```bash
  docker exec db psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "\dt"
  ```

- **Show all agent profiles**:

  ```bash
  docker exec db psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "SELECT * FROM agent_profiles;"
  ```

- **Show all tools**:

  ```bash
  docker exec db psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "SELECT * FROM tools;"
  ```

- **Show all conversations**:

  ```bash
  docker exec db psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "SELECT * FROM conversations;"
  ```

- **Show agent profile to tool mappings**:
  ```bash
  docker exec db psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "SELECT * FROM agent_profiles_tools;"
  ```

## Documentation

This project includes further documentation on potential architectural enhancements and best practices. You can find these documents in the `/doc` directory:

- **[Authentication, Authorization & Multi-Tenancy](./doc/auth-architecture.md)**: A guide on how to implement multi-tenancy and role-based access control.
- **[Domain Modeling](./doc/domain-modeling.md)**: How to enhance the domain model using Value Objects to improve type safety and encapsulate business logic.
- **[Input Validation](./doc/input-validation.md)**: A proposal for using Zod for robust, schema-based input validation at the controller level.
- **[Custom Error Handling](./doc/error-handling.md)**: A strategy for implementing a hierarchy of custom errors for more robust and debuggable error handling.
- **[Streaming Responses](./doc/streaming-responses.md)**: An explanation of how to implement streaming for conversational responses to improve user experience.
