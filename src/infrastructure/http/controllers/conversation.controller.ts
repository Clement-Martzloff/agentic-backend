import { FastifyReply, FastifyRequest } from 'fastify';

import { SendMessageUseCase } from '@/application/usecases/conversations/send-message.usecase.js';
import { StartConversationUseCase } from '@/application/usecases/conversations/start-conversation.usecase.js';
import { Message } from '@/domain/services/conversational-agent.service.js';

type StartConversationBodyDto = {
  body: {
    agentProfileId: string;
    initialMessageContent: string;
  };
};

type SendMessageParamsDto = {
  params: {
    conversationId: string;
  };
};

type SendMessageBodyDto = {
  body: {
    messageContent: string;
  };
};

type ConversationResponseDto = {
  conversationId: string;
  messages: Message[];
};

export class ConversationController {
  constructor(
    private startConversationUseCase: StartConversationUseCase,
    private sendMessageUseCase: SendMessageUseCase,
  ) {}

  async startConversation(request: FastifyRequest, reply: FastifyReply) {
    try {
      const {
        body: { agentProfileId, initialMessageContent },
      } = request as StartConversationBodyDto;

      const { conversationId, messages } = await this.startConversationUseCase.execute(
        agentProfileId,
        initialMessageContent,
      );

      reply.status(201).send({ conversationId, messages } as ConversationResponseDto);
    } catch (error: unknown) {
      reply.status(400).send({ message: (error as Error).message });
    }
  }

  async sendMessage(request: FastifyRequest, reply: FastifyReply) {
    try {
      const {
        params: { conversationId },
      } = request as SendMessageParamsDto;

      const {
        body: { messageContent },
      } = request as SendMessageBodyDto;

      const { messages } = await this.sendMessageUseCase.execute(conversationId, messageContent);

      reply.status(200).send({ conversationId, messages } as ConversationResponseDto);
    } catch (error: unknown) {
      reply.status(400).send({ message: (error as Error).message });
    }
  }
}
