import { AgentServiceFactory } from '@/domain/factories/agent-service.factory.js';
import { AgentProfileRepository } from '@/domain/repositories/agent-profile.repository.js';
import { ConversationRepository } from '@/domain/repositories/conversation.repository.js';
import {
  ConversationnalAgentService,
  Message,
} from '@/domain/services/conversational-agent.service.js';

type SendMessageOutput = { messages: Message[] };

export class SendMessageUseCase {
  constructor(
    private conversationRepository: ConversationRepository,
    private agentProfileRepository: AgentProfileRepository,
    private agentServiceFactory: AgentServiceFactory<ConversationnalAgentService>,
  ) {}

  async execute(conversationId: string, messageContent: string): Promise<SendMessageOutput> {
    const conversationFound = await this.conversationRepository.selectOne(conversationId);

    if (!conversationFound) {
      throw new Error(`Conversation with ID ${conversationId} not found.`);
    }

    const agentProfileFound = await this.agentProfileRepository.selectOne(
      conversationFound.agentProfileId,
    );

    if (!agentProfileFound) {
      throw new Error(`Agent profile with ID ${conversationFound.agentProfileId} not found.`);
    }

    const conversationalAgent = this.agentServiceFactory.create(agentProfileFound.name);

    const response = await conversationalAgent.getResponse(conversationFound.id, messageContent);

    return { messages: response };
  }
}
