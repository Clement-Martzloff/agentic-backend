import { FastifyInstance } from 'fastify';

import { ConversationController } from '@/infrastructure/http/controllers/conversation.controller.js';

export function registerConversationRoutes(
  fastify: FastifyInstance,
  controller: ConversationController,
) {
  fastify.post('/conversations', {
    schema: {
      tags: ['Conversation'],
      summary: 'Start a new conversation with an agent',
      body: {
        type: 'object',
        required: ['agentProfileId', 'initialMessageContent'],
        properties: {
          agentProfileId: {
            type: 'string',
            description: 'ID of the agent profile to converse with',
          },
          initialMessageContent: {
            type: 'string',
            description: 'Initial message content to the agent',
          },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            conversationId: { type: 'string', description: 'ID of the new conversation' },
            messages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  content: { type: 'string' },
                  type: { type: 'string' },
                },
              },
              description: 'Array of messages in the conversation',
            },
          },
        },
      },
    },
    handler: controller.startConversation.bind(controller),
  });

  fastify.post('/conversations/:conversationId/messages', {
    schema: {
      tags: ['Conversation'],
      summary: 'Send a message to an existing conversation',
      params: {
        type: 'object',
        required: ['conversationId'],
        properties: {
          conversationId: { type: 'string', description: 'ID of the conversation' },
        },
      },
      body: {
        type: 'object',
        required: ['messageContent'],
        properties: {
          messageContent: { type: 'string', description: 'Content of the message' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            conversationId: { type: 'string', description: 'ID of the conversation' },
            messages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  content: { type: 'string' },
                  role: { type: 'string' },
                  isToolCall: { type: 'boolean' },
                },
              },
              description: 'Array of messages in the conversation',
            },
          },
        },
      },
    },
    handler: controller.sendMessage.bind(controller),
  });
}
