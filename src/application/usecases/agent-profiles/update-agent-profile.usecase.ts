import { AgentProfileName } from '@/domain/constants/agent-profile.constant.js';
import { AgentProfileRepository } from '@/domain/repositories/agent-profile.repository.js';

export class UpdateAgentProfileUseCase {
  constructor(private agentProfileRepository: AgentProfileRepository) {}

  async execute(
    id: string,
    data: { name?: AgentProfileName; toolIds?: string[] },
  ): Promise<boolean> {
    return this.agentProfileRepository.update({
      id,
      ...data,
    });
  }
}
