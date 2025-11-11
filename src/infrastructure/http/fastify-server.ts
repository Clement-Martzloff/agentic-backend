import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import Fastify from 'fastify';

import agentProfileRoutes from '@/infrastructure/http/routes/agent-profile.route.js';
import conversationRoutes from '@/infrastructure/http/routes/conversation.route.js';

export async function buildServer() {
  const fastify = Fastify({
    logger: true,
  });

  fastify.setErrorHandler((error, request, reply) => {
    /**
     * Intercepted errors:
     * - Any error thrown in routes, controllers, use cases, or repositories
     * - Promise rejections in async handlers or hooks
     */

    request.log.error({ err: error }, 'Error intercepted during request lifecycle');

    const statusCode = (error as { statusCode?: number }).statusCode || 500;

    reply.status(statusCode).send({
      success: false,
      message: statusCode < 500 ? (error as Error).message : 'Internal Server Error',
    });
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
      tags: [
        { name: 'Agent Profile', description: 'Agent Profile related endpoints' },
        { name: 'Conversation', description: 'Conversation related endpoints' },
      ],
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

  fastify.register(agentProfileRoutes);
  fastify.register(conversationRoutes);

  return fastify;
}
