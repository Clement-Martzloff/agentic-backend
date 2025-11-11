import { FastifyInstance } from 'fastify';

import { container } from '@/infrastructure/config/container.js';

export default async function (fastify: FastifyInstance) {
  const agentProfileController = container.agentProfileController;

  fastify.get('/agent-profiles', {
    schema: {
      tags: ['Agent Profile'],
      summary: 'Get all agent profiles',
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              tools: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
              },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        500: { type: 'object', properties: { message: { type: 'string' } } },
      },
    },
    handler: agentProfileController.listAgentProfiles.bind(agentProfileController),
  });

  fastify.post('/agent-profiles', {
    schema: {
      tags: ['Agent Profile'],
      summary: 'Create a new agent profile',
      body: {
        type: 'object',
        required: ['name', 'toolIds'],
        properties: {
          name: { type: 'string' },
          toolIds: { type: 'array', items: { type: 'string' } },
        },
      },
      response: {
        201: { type: 'string' }, // matches controller returning agentProfileId as string
        500: { type: 'object', properties: { message: { type: 'string' } } },
      },
    },
    handler: agentProfileController.createAgentProfile.bind(agentProfileController),
  });

  fastify.get('/agent-profiles/:id', {
    schema: {
      tags: ['Agent Profile'],
      summary: 'Get an agent profile by id',
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            tools: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        404: { type: 'object', properties: { message: { type: 'string' } } },
        500: { type: 'object', properties: { message: { type: 'string' } } },
      },
    },
    handler: agentProfileController.getAgentProfile.bind(agentProfileController),
  });

  fastify.put('/agent-profiles/:id', {
    schema: {
      tags: ['Agent Profile'],
      summary: 'Update an agent profile',
      params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          toolIds: { type: 'array', items: { type: 'string' } },
        },
      },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        404: { type: 'object', properties: { message: { type: 'string' } } },
        500: { type: 'object', properties: { message: { type: 'string' } } },
      },
    },
    handler: agentProfileController.updateAgentProfile.bind(agentProfileController),
  });

  fastify.delete('/agent-profiles/:id', {
    schema: {
      tags: ['Agent Profile'],
      summary: 'Delete an agent profile',
      params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
      response: {
        204: { description: 'No Content' }, // No body
        404: { type: 'object', properties: { message: { type: 'string' } } },
        500: { type: 'object', properties: { message: { type: 'string' } } },
      },
    },
    handler: agentProfileController.deleteAgentProfile.bind(agentProfileController),
  });
}
