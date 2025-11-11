import { FastifyReply, FastifyRequest } from 'fastify';
import { describe, expect, it, vi } from 'vitest';

import { SendMessageUseCase } from '@/application/usecases/conversations/send-message.usecase.js';
import { StartConversationUseCase } from '@/application/usecases/conversations/start-conversation.usecase.js';
import { AGENT_PROFILE_NAMES } from '@/domain/constants/agent-profile.constant.js';
import { AgentProfileEntity } from '@/domain/entities/agent-profile.entity.js';
import { ConversationEntity } from '@/domain/entities/conversation.entity.js';
import { AgentServiceFactory } from '@/domain/factories/agent-service.factory.js';
import { AgentProfileRepository } from '@/domain/repositories/agent-profile.repository.js';
import { ConversationRepository } from '@/domain/repositories/conversation.repository.js';
import {
  ConversationnalAgentService,
  MessageRole,
} from '@/domain/services/conversational-agent.service.js';
import { ConversationController } from '@/infrastructure/http/controllers/conversation.controller.js';

describe('ConversationController', () => {
  const mockConversationRepository = {
    insert: vi.fn(),
    selectOne: vi.fn(),
  } as unknown as ConversationRepository;

  const mockAgentProfileRepository = {
    selectOne: vi.fn(),
  } as unknown as AgentProfileRepository;

  const mockAgentServiceFactory = {
    create: vi.fn(),
  } as unknown as AgentServiceFactory<ConversationnalAgentService>;

  const mockConversationalAgent = {
    getResponse: vi.fn(),
  } as unknown as ConversationnalAgentService;

  const startConversationUseCase = new StartConversationUseCase(
    mockConversationRepository,
    mockAgentProfileRepository,
    mockAgentServiceFactory,
  );

  const sendMessageUseCase = new SendMessageUseCase(
    mockConversationRepository,
    mockAgentProfileRepository,
    mockAgentServiceFactory,
  );

  const conversationController = new ConversationController(
    startConversationUseCase,
    sendMessageUseCase,
  );

  it('should start a conversation and return it', async () => {
    // Given
    const agentProfileId = 'agent-1';
    const initialMessageContent = 'Hello';
    const newConversationId = 'conv-1';
    const mockAgentProfile: AgentProfileEntity = {
      id: agentProfileId,
      name: AGENT_PROFILE_NAMES.WEATHER_FORECAST,
    };
    const mockMessages = [{ role: 'assistant' as MessageRole, content: 'Hi!' }];

    vi.spyOn(mockAgentProfileRepository, 'selectOne').mockResolvedValue(mockAgentProfile);
    vi.spyOn(mockConversationRepository, 'insert').mockResolvedValue(newConversationId);
    vi.spyOn(mockAgentServiceFactory, 'create').mockReturnValue(mockConversationalAgent);
    vi.spyOn(mockConversationalAgent, 'getResponse').mockResolvedValue(mockMessages);

    const mockRequest = {
      body: { agentProfileId, initialMessageContent },
    } as FastifyRequest<{
      Body: { agentProfileId: string; initialMessageContent: string };
    }>;

    const mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    // When
    await conversationController.startConversation(mockRequest, mockReply);

    // Then
    expect(mockAgentProfileRepository.selectOne).toHaveBeenCalledWith(agentProfileId);
    expect(mockConversationRepository.insert).toHaveBeenCalledWith({
      agentProfileId,
    });
    expect(mockAgentServiceFactory.create).toHaveBeenCalledWith(mockAgentProfile.name);
    expect(mockConversationalAgent.getResponse).toHaveBeenCalledWith(
      newConversationId,
      initialMessageContent,
    );
    expect(mockReply.status).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith({
      conversationId: newConversationId,
      messages: mockMessages,
    });
  });

  it('should send a message and return the updated conversation', async () => {
    // Given
    const conversationId = 'conv-1';
    const messageContent = 'What is the weather?';
    const agentProfileId = 'agent-1';
    const mockConversation: ConversationEntity = {
      id: conversationId,
      agentProfileId,
    };
    const mockAgentProfile: AgentProfileEntity = {
      id: agentProfileId,
      name: AGENT_PROFILE_NAMES.WEATHER_FORECAST,
    };
    const mockMessages = [{ role: 'assistant' as MessageRole, content: 'It is sunny.' }];

    vi.spyOn(mockConversationRepository, 'selectOne').mockResolvedValue(mockConversation);
    vi.spyOn(mockAgentProfileRepository, 'selectOne').mockResolvedValue(mockAgentProfile);
    vi.spyOn(mockAgentServiceFactory, 'create').mockReturnValue(mockConversationalAgent);
    vi.spyOn(mockConversationalAgent, 'getResponse').mockResolvedValue(mockMessages);

    const mockRequest = {
      params: { conversationId },
      body: { messageContent },
    } as FastifyRequest<{
      Params: { conversationId: string };
      Body: { messageContent: string };
    }>;

    const mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    // When
    await conversationController.sendMessage(mockRequest, mockReply);

    // Then
    expect(mockConversationRepository.selectOne).toHaveBeenCalledWith(conversationId);
    expect(mockAgentProfileRepository.selectOne).toHaveBeenCalledWith(agentProfileId);
    expect(mockAgentServiceFactory.create).toHaveBeenCalledWith(mockAgentProfile.name);
    expect(mockConversationalAgent.getResponse).toHaveBeenCalledWith(
      conversationId,
      messageContent,
    );
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith({
      conversationId,
      messages: mockMessages,
    });
  });

  it('should throw an error if agent profile is not found when starting a conversation', async () => {
    // Given
    const agentProfileId = 'non-existent-agent';
    const initialMessageContent = 'Hello';
    const errorMessage = `Agent profile with ID ${agentProfileId} not found.`;

    vi.spyOn(mockAgentProfileRepository, 'selectOne').mockResolvedValue(null);

    const mockRequest = {
      body: { agentProfileId, initialMessageContent },
    } as FastifyRequest<{
      Body: { agentProfileId: string; initialMessageContent: string };
    }>;

    const mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    // When & Then
    await expect(conversationController.startConversation(mockRequest, mockReply)).rejects.toThrow(
      errorMessage,
    );
  });
});
