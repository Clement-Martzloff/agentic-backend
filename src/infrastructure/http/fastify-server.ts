import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import Fastify from 'fastify';

import { container } from '@/infrastructure/config/container.js';
import { registerConversationRoutes } from '@/infrastructure/http/routes/conversation.route.js';

export async function buildServer() {
  const fastify = Fastify({
    logger: true,
  });

  await fastify.register(swagger, {
    swagger: {
      info: {
        title: 'Agentic Backend API',
        description: 'API documentation for the Agentic Backend',
        version: '1.0.0',
      },
      host: 'localhost:3000',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [{ name: 'Conversation', description: 'Conversation related endpoints' }],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/doc',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (_request, _reply, next) {
        next();
      },
      preHandler: function (_request, _reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    // Add custom CSS to hide the "Try it out" button
    // This is a temporary measure as the API is not fully functional yet.
    // Once the API is ready for interaction, this can be removed.
    // This is a placeholder for now.
    // customCss: '.swagger-ui .opblock-control-box { display: none; }',
  });

  registerConversationRoutes(fastify, container.conversationController);

  return fastify;
}
