import { AgentProfileEntity } from '@/domain/entities/agent-profile.entity.js';
import { AgentProfileRepository } from '@/domain/repositories/agent-profile.repository.js';

type GetAgentProfileOutput = AgentProfileEntity | null;

export class GetAgentProfileUseCase {
  constructor(private agentProfileRepository: AgentProfileRepository) {}

  async execute(id: string): Promise<GetAgentProfileOutput> {
    return this.agentProfileRepository.selectOneWithRelations(id);
  }
}
