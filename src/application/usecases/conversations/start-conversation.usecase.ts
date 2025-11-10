import { AgentServiceFactory } from '@/domain/factories/agent-service.factory.js';
import { AgentProfileRepository } from '@/domain/repositories/agent-profile.repository.js';
import { ConversationRepository } from '@/domain/repositories/conversation.repository.js';
import {
  ConversationnalAgentService,
  Message,
} from '@/domain/services/conversational-agent.service.js';

type StartConversationOutput = { conversationId: string; messages: Message[] };

export class StartConversationUseCase {
  constructor(
    private conversationRepository: ConversationRepository,
    private agentProfileRepository: AgentProfileRepository,
    private agentServiceFactory: AgentServiceFactory<ConversationnalAgentService>,
  ) {}

  async execute(
    agentProfileId: string,
    initialMessageContent: string,
  ): Promise<StartConversationOutput> {
    const agentProfileFound = await this.agentProfileRepository.selectOne(agentProfileId);

    if (!agentProfileFound) {
      throw new Error(`Agent profile with ID ${agentProfileId} not found.`);
    }

    const newConversationId = await this.conversationRepository.insert({
      agentProfileId: agentProfileFound.id,
    });

    const conversationalAgent = this.agentServiceFactory.create(agentProfileFound.name);

    const response = await conversationalAgent.getResponse(
      newConversationId,
      initialMessageContent,
    );

    return { conversationId: newConversationId, messages: response };
  }
}
