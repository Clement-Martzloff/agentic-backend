import { AgentProfileRepository } from '@/domain/repositories/agent-profile.repository.js';

export class DeleteAgentProfileUseCase {
  constructor(private agentProfileRepository: AgentProfileRepository) {}

  async execute(id: string): Promise<boolean> {
    return this.agentProfileRepository.delete(id);
  }
}
