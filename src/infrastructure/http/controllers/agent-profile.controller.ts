import { FastifyReply, FastifyRequest } from 'fastify';

import { CreateAgentProfileUseCase } from '@/application/usecases/agent-profiles/create-agent-profile.usecase.js';
import { DeleteAgentProfileUseCase } from '@/application/usecases/agent-profiles/delete-agent-profile.usecase.js';
import { GetAgentProfileUseCase } from '@/application/usecases/agent-profiles/get-agent-profile.usecase.js';
import { ListAgentProfilesUseCase } from '@/application/usecases/agent-profiles/list-agent-profiles.usecase.js';
import { UpdateAgentProfileUseCase } from '@/application/usecases/agent-profiles/update-agent-profile.usecase.js';
import { AgentProfileName } from '@/domain/constants/agent-profile.constant.js';
import { AgentProfileEntity } from '@/domain/entities/agent-profile.entity.js';

type AgentProfileParamDto = {
  id: string;
};
type CreateAgentProfileBodyDto = {
  name: AgentProfileName;
  toolIds: string[];
};
type UpdateAgentProfileBodyDto = {
  name?: AgentProfileName;
  toolIds?: string[];
};

type AgentProfileResponseDto = AgentProfileEntity;
type ListAgentProfilesResponseDto = AgentProfileEntity[];

export class AgentProfileController {
  constructor(
    private createAgentProfileUseCase: CreateAgentProfileUseCase,
    private deleteAgentProfileUseCase: DeleteAgentProfileUseCase,
    private getAgentProfileUseCase: GetAgentProfileUseCase,
    private listAgentProfilesUseCase: ListAgentProfilesUseCase,
    private updateAgentProfileUseCase: UpdateAgentProfileUseCase,
  ) {}

  async createAgentProfile(request: FastifyRequest, reply: FastifyReply) {
    const { name, toolIds } = request.body as CreateAgentProfileBodyDto;
    const agentProfileId = await this.createAgentProfileUseCase.execute(name, toolIds);
    return reply.status(201).send(agentProfileId as string);
  }

  async deleteAgentProfile(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as AgentProfileParamDto;
    const isDeleted = await this.deleteAgentProfileUseCase.execute(id);
    if (!isDeleted) {
      return reply.status(404).send({ message: 'Agent Profile not found' });
    }
    return reply.status(204).send();
  }

  async getAgentProfile(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as AgentProfileParamDto;
    const agentProfile = await this.getAgentProfileUseCase.execute(id);
    if (!agentProfile) {
      return reply.status(404).send({ message: 'Agent Profile not found' });
    }
    return reply.status(200).send(agentProfile as AgentProfileResponseDto);
  }

  async listAgentProfiles(_: FastifyRequest, reply: FastifyReply) {
    const agentProfiles = await this.listAgentProfilesUseCase.execute();
    return reply.status(200).send(agentProfiles as ListAgentProfilesResponseDto);
  }

  async updateAgentProfile(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as AgentProfileParamDto;
    const { name, toolIds } = request.body as UpdateAgentProfileBodyDto;
    const isUpdated = await this.updateAgentProfileUseCase.execute(id, {
      name,
      toolIds,
    });
    if (!isUpdated) {
      return reply.status(404).send({ message: 'Agent Profile not found' });
    }
    return reply.status(200).send({ message: 'Agent Profile updated successfully' });
  }
}
