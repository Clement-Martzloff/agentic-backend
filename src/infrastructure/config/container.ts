import { CreateAgentProfileUseCase } from '@/application/usecases/agent-profiles/create-agent-profile.usecase.js';
import { DeleteAgentProfileUseCase } from '@/application/usecases/agent-profiles/delete-agent-profile.usecase.js';
import { GetAgentProfileUseCase } from '@/application/usecases/agent-profiles/get-agent-profile.usecase.js';
import { ListAgentProfilesUseCase } from '@/application/usecases/agent-profiles/list-agent-profiles.usecase.js';
import { UpdateAgentProfileUseCase } from '@/application/usecases/agent-profiles/update-agent-profile.usecase.js';
import { SendMessageUseCase } from '@/application/usecases/conversations/send-message.usecase.js';
import { StartConversationUseCase } from '@/application/usecases/conversations/start-conversation.usecase.js';
import { ConversationnalAgentServiceFactory } from '@/infrastructure/conversational-agent/conversational-agent-service.factory.js';
import { db } from '@/infrastructure/database/knex/db.js';
import { KnexAgentProfileRepository } from '@/infrastructure/database/knex/repositories/knex-agent-profile.repository.js';
import { KnexConversationRepository } from '@/infrastructure/database/knex/repositories/knex-conversation.repository.js';
import { AgentProfileController } from '@/infrastructure/http/controllers/agent-profile.controller.js';
import { ConversationController } from '@/infrastructure/http/controllers/conversation.controller.js';

const agentProfileRepository = new KnexAgentProfileRepository(db);
const conversationRepository = new KnexConversationRepository(db);

const agentServiceFactory = new ConversationnalAgentServiceFactory();

const createAgentProfileUseCase = new CreateAgentProfileUseCase(agentProfileRepository);
const deleteAgentProfileUseCase = new DeleteAgentProfileUseCase(agentProfileRepository);
const getAgentProfileUseCase = new GetAgentProfileUseCase(agentProfileRepository);
const listAgentProfilesUseCase = new ListAgentProfilesUseCase(agentProfileRepository);
const updateAgentProfileUseCase = new UpdateAgentProfileUseCase(agentProfileRepository);

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

const agentProfileController = new AgentProfileController(
  createAgentProfileUseCase,
  deleteAgentProfileUseCase,
  getAgentProfileUseCase,
  listAgentProfilesUseCase,
  updateAgentProfileUseCase,
);

const conversationController = new ConversationController(
  startConversationUseCase,
  sendMessageUseCase,
);

export const container = {
  agentProfileController,
  conversationController,
};
