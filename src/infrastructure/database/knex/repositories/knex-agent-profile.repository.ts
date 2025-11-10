import { Knex } from 'knex';

import { AgentProfileName } from '@/domain/constants/agent-profile.constant.js';
import { AgentProfileEntity } from '@/domain/entities/agent-profile.entity.js';
import { ToolEntity } from '@/domain/entities/tool.entity.js';
import {
  AgentProfileRepository,
  InsertAgentProfileDto,
  UpdateAgentProfileDto,
} from '@/domain/repositories/agent-profile.repository.js';

type AgentProfileRow = {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  tools?: ToolEntity[] | null;
};

export class KnexAgentProfileRepository implements AgentProfileRepository {
  constructor(private knex: Knex) {}

  public async selectOne(id: string): Promise<AgentProfileEntity | null> {
    const row = await this.knex('agent_profiles').where({ id }).first();

    if (!row) {
      return null;
    }

    return this.rowToEntity(row);
  }

  public async selectOneWithRelations(id: string): Promise<AgentProfileEntity | null> {
    const row = await this.knex('agent_profiles as ap')
      .select(
        'ap.id',
        'ap.name',
        'ap.created_at',
        'ap.updated_at',
        this.knex.raw(
          `jsonb_agg(
            jsonb_build_object('id', t.id, 'name', t.name)
           ) FILTER (WHERE t.id IS NOT NULL) as tools`,
        ),
      )
      .leftJoin('agent_profiles_tools as apt', 'ap.id', 'apt.agent_profile_id')
      .leftJoin('tools as t', 'apt.tool_id', 't.id')
      .where('ap.id', id)
      .groupBy('ap.id')
      .first();

    if (!row) {
      return null;
    }

    return this.rowToEntity(row);
  }

  public async selectAllWithRelations(): Promise<AgentProfileEntity[]> {
    const rows = await this.knex('agent_profiles as ap')
      .select(
        'ap.id',
        'ap.name',
        'ap.created_at',
        'ap.updated_at',
        this.knex.raw(
          `jsonb_agg(
            jsonb_build_object('id', t.id, 'name', t.name)
           ) FILTER (WHERE t.id IS NOT NULL) as tools`,
        ),
      )
      .leftJoin('agent_profiles_tools as apt', 'ap.id', 'apt.agent_profile_id')
      .leftJoin('tools as t', 'apt.tool_id', 't.id')
      .groupBy('ap.id');

    return rows.map((row) => this.rowToEntity(row));
  }

  public async insert(dto: InsertAgentProfileDto): Promise<string> {
    const newAgentProfileId = await this.knex.transaction(async (trx) => {
      const [newAgentProfile] = await trx('agent_profiles')
        .insert({ name: dto.name })
        .returning('id');

      const agentProfileId = newAgentProfile.id;

      if (dto.toolIds && dto.toolIds.length > 0) {
        const relations = dto.toolIds.map((toolId) => ({
          agent_profile_id: agentProfileId,
          tool_id: toolId,
        }));
        await trx('agent_profiles_tools').insert(relations);
      }

      return agentProfileId;
    });

    return newAgentProfileId;
  }

  public async update(dto: UpdateAgentProfileDto): Promise<boolean> {
    await this.knex.transaction(async (trx) => {
      if (dto.name) {
        await trx('agent_profiles')
          .where({ id: dto.id })
          .update({ name: dto.name, updated_at: this.knex.fn.now() });
      }

      if (dto.toolIds) {
        // The "delete then insert" pattern is the most robust way to handle this.
        // First, delete all existing relations for this agent.
        await trx('agent_profiles_tools').where({ agent_profile_id: dto.id }).del();

        // Then, insert the new set of relations.
        if (dto.toolIds.length > 0) {
          const newRelations = dto.toolIds.map((toolId) => ({
            agent_profile_id: dto.id,
            tool_id: toolId,
          }));
          await trx('agent_profiles_tools').insert(newRelations);
        }
      }
    });

    return Boolean(dto.name || dto.toolIds);
  }

  public async delete(id: string): Promise<boolean> {
    const deletedRows = await this.knex('agent_profiles').where({ id }).del();
    return deletedRows > 0;
  }

  private rowToEntity(row: AgentProfileRow): AgentProfileEntity {
    return {
      id: row.id,
      name: row.name as AgentProfileName,
      tools: row.tools || [],
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
