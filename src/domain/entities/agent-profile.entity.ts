import { AgentProfileName } from '@/domain/constants/agent-profile.constant.js';
import { ToolEntity } from '@/domain/entities/tool.entity.js';

export interface AgentProfileEntity {
  id: string;
  name: AgentProfileName;
  tools?: ToolEntity[];
  toolIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
