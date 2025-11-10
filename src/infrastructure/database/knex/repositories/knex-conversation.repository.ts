import { Knex } from 'knex';

import { ConversationEntity } from '@/domain/entities/conversation.entity.js';
import { ConversationRepository } from '@/domain/repositories/conversation.repository.js';

export class KnexConversationRepository implements ConversationRepository {
  private readonly CONVERSATION_TABLE = 'conversations';

  constructor(private knex: Knex) {}

  public async selectOne(id: string): Promise<ConversationEntity | null> {
    const row = await this.knex(this.CONVERSATION_TABLE).where({ id }).first();

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      agentProfileId: row.agent_profile_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  public async insert(
    conversation: Omit<ConversationEntity, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<string> {
    const [newConversation] = await this.knex(this.CONVERSATION_TABLE)
      .insert({
        agent_profile_id: conversation.agentProfileId,
      })
      .returning('*');

    return newConversation.id;
  }
}
