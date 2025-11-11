import { AgentProfileEntity } from '@/domain/entities/agent-profile.entity.js';

export type InsertAgentProfileDto = Omit<AgentProfileEntity, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateAgentProfileDto = Partial<Omit<AgentProfileEntity, 'createdAt'>>;

export interface AgentProfileRepository {
  selectOne(id: string): Promise<AgentProfileEntity | null>;
  selectOneWithRelations(id: string): Promise<AgentProfileEntity | null>;
  selectAllWithRelations(): Promise<AgentProfileEntity[]>;
  insert(dto: InsertAgentProfileDto): Promise<string>;
  update(dto: UpdateAgentProfileDto): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}
