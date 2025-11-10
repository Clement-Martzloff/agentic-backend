import { ConversationEntity } from '@/domain/entities/conversation.entity.js';

export interface ConversationRepository {
  selectOne(id: string): Promise<ConversationEntity | null>;
  insert(conversation: Omit<ConversationEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
}
