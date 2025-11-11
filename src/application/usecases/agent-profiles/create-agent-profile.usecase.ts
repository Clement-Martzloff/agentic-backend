import { AgentProfileName } from '@/domain/constants/agent-profile.constant.js';
import { AgentProfileRepository } from '@/domain/repositories/agent-profile.repository.js';

export class CreateAgentProfileUseCase {
  constructor(private agentProfileRepository: AgentProfileRepository) {}

  async execute(name: AgentProfileName, toolIds: string[]): Promise<string> {
    const agentProfileId = await this.agentProfileRepository.insert({
      name,
      toolIds,
    });

    return agentProfileId;
  }
}
