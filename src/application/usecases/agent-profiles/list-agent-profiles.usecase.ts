import { AgentProfileEntity } from '@/domain/entities/agent-profile.entity.js';
import { AgentProfileRepository } from '@/domain/repositories/agent-profile.repository.js';

type ListAgentProfilesOutput = AgentProfileEntity[];

export class ListAgentProfilesUseCase {
  constructor(private agentProfileRepository: AgentProfileRepository) {}

  async execute(): Promise<ListAgentProfilesOutput> {
    return this.agentProfileRepository.selectAllWithRelations();
  }
}
