import { SendMessageUseCase } from '@/application/usecases/conversations/send-message.usecase.js';
import { StartConversationUseCase } from '@/application/usecases/conversations/start-conversation.usecase.js';
import { ConversationnalAgentServiceFactory } from '@/infrastructure/conversational-agent/conversational-agent-service.factory.js';
import { db } from '@/infrastructure/database/knex/db.js';
import { KnexAgentProfileRepository } from '@/infrastructure/database/knex/repositories/knex-agent-profile.repository.js';
import { KnexConversationRepository } from '@/infrastructure/database/knex/repositories/knex-conversation.repository.js';
import { ConversationController } from '@/infrastructure/http/controllers/conversation.controller.js';

const agentProfileRepository = new KnexAgentProfileRepository(db);
const conversationRepository = new KnexConversationRepository(db);

const agentServiceFactory = new ConversationnalAgentServiceFactory();

const startConversationUseCase = new StartConversationUseCase(
  conversationRepository,
  agentProfileRepository,
  agentServiceFactory,
);
const sendMessageUseCase = new SendMessageUseCase(
  conversationRepository,
  agentProfileRepository,
  agentServiceFactory,
);

const conversationController = new ConversationController(
  startConversationUseCase,
  sendMessageUseCase,
);

export const container = {
  conversationController,
};
