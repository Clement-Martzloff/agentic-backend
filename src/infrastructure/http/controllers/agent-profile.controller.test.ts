import { FastifyReply, FastifyRequest } from 'fastify';
import { describe, expect, it, vi } from 'vitest';

import { CreateAgentProfileUseCase } from '@/application/usecases/agent-profiles/create-agent-profile.usecase.js';
import { DeleteAgentProfileUseCase } from '@/application/usecases/agent-profiles/delete-agent-profile.usecase.js';
import { GetAgentProfileUseCase } from '@/application/usecases/agent-profiles/get-agent-profile.usecase.js';
import { ListAgentProfilesUseCase } from '@/application/usecases/agent-profiles/list-agent-profiles.usecase.js';
import { UpdateAgentProfileUseCase } from '@/application/usecases/agent-profiles/update-agent-profile.usecase.js';
import { AGENT_PROFILE_NAMES } from '@/domain/constants/agent-profile.constant.js';
import { AgentProfileEntity } from '@/domain/entities/agent-profile.entity.js';
import { AgentProfileRepository } from '@/domain/repositories/agent-profile.repository.js';
import { AgentProfileController } from '@/infrastructure/http/controllers/agent-profile.controller.js';

describe('AgentProfileController', () => {
  const mockAgentProfileRepository = {
    insert: vi.fn(),
    selectAllWithRelations: vi.fn(),
  } as unknown as AgentProfileRepository;

  // Mock other use cases that AgentProfileController depends on, but are not being tested here
  const mockDeleteAgentProfileUseCase = {
    execute: vi.fn(),
  } as unknown as DeleteAgentProfileUseCase;
  const mockGetAgentProfileUseCase = {
    execute: vi.fn(),
  } as unknown as GetAgentProfileUseCase;
  const mockUpdateAgentProfileUseCase = {
    execute: vi.fn(),
  } as unknown as UpdateAgentProfileUseCase;

  const createAgentProfileUseCase = new CreateAgentProfileUseCase(mockAgentProfileRepository);
  const listAgentProfilesUseCase = new ListAgentProfilesUseCase(mockAgentProfileRepository);

  const agentProfileController = new AgentProfileController(
    createAgentProfileUseCase,
    mockDeleteAgentProfileUseCase,
    mockGetAgentProfileUseCase,
    listAgentProfilesUseCase,
    mockUpdateAgentProfileUseCase,
  );

  it('should create an agent profile and return its ID', async () => {
    // Given
    const agentProfileName = AGENT_PROFILE_NAMES.WEATHER_FORECAST;
    const toolIds = ['tool-1', 'tool-2'];
    const newAgentProfileId = 'agent-profile-1';

    vi.spyOn(mockAgentProfileRepository, 'insert').mockResolvedValue(newAgentProfileId);

    const mockRequest = {
      body: { name: agentProfileName, toolIds },
    } as FastifyRequest<{
      Body: {
        name: (typeof AGENT_PROFILE_NAMES)[keyof typeof AGENT_PROFILE_NAMES];
        toolIds: string[];
      };
    }>;

    const mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    // When
    await agentProfileController.createAgentProfile(mockRequest, mockReply);

    // Then
    expect(mockAgentProfileRepository.insert).toHaveBeenCalledWith({
      name: agentProfileName,
      toolIds,
    });
    expect(mockReply.status).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith(newAgentProfileId);
  });

  it('should list all agent profiles', async () => {
    // Given
    const mockAgentProfiles: AgentProfileEntity[] = [
      { id: 'agent-1', name: AGENT_PROFILE_NAMES.WEATHER_FORECAST },
      { id: 'agent-2', name: AGENT_PROFILE_NAMES.CODE_GENERATOR },
    ];

    vi.spyOn(mockAgentProfileRepository, 'selectAllWithRelations').mockResolvedValue(
      mockAgentProfiles,
    );

    const mockRequest = {} as FastifyRequest;

    const mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    // When
    await agentProfileController.listAgentProfiles(mockRequest, mockReply);

    // Then
    expect(mockAgentProfileRepository.selectAllWithRelations).toHaveBeenCalled();
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith(mockAgentProfiles);
  });

  it('should throw an error when creating an agent profile fails', async () => {
    // Given
    const agentProfileName = AGENT_PROFILE_NAMES.WEATHER_FORECAST;
    const toolIds = ['tool-1', 'tool-2'];
    const errorMessage = 'Database error';

    vi.spyOn(mockAgentProfileRepository, 'insert').mockRejectedValue(new Error(errorMessage));

    const mockRequest = {
      body: { name: agentProfileName, toolIds },
    } as FastifyRequest<{
      Body: {
        name: (typeof AGENT_PROFILE_NAMES)[keyof typeof AGENT_PROFILE_NAMES];
        toolIds: string[];
      };
    }>;

    const mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    // When & Then
    await expect(agentProfileController.createAgentProfile(mockRequest, mockReply)).rejects.toThrow(
      errorMessage,
    );
  });
});
