import { FastifyReply, FastifyRequest } from 'fastify';

import { SendMessageUseCase } from '@/application/usecases/conversations/send-message.usecase.js';
import { StartConversationUseCase } from '@/application/usecases/conversations/start-conversation.usecase.js';
import { Message } from '@/domain/services/conversational-agent.service.js';

type StartConversationBodyDto = {
  agentProfileId: string;
  initialMessageContent: string;
};
type ConversationParamsDto = {
  conversationId: string;
};
type SendMessageBodyDto = {
  messageContent: string;
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
    const { agentProfileId, initialMessageContent } = request.body as StartConversationBodyDto;
    const { conversationId, messages } = await this.startConversationUseCase.execute(
      agentProfileId,
      initialMessageContent,
    );
    reply.status(201).send({ conversationId, messages } as ConversationResponseDto);
  }

  async sendMessage(request: FastifyRequest, reply: FastifyReply) {
    const { conversationId } = request.params as ConversationParamsDto;
    const { messageContent } = request.body as SendMessageBodyDto;
    const { messages } = await this.sendMessageUseCase.execute(conversationId, messageContent);
    reply.status(200).send({ conversationId, messages } as ConversationResponseDto);
  }
}
