import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('agent_profiles_tools', (table) => {
    table
      .uuid('agent_profile_id')
      .notNullable()
      .references('id')
      .inTable('agent_profiles')
      .onDelete('CASCADE');
    table.uuid('tool_id').notNullable().references('id').inTable('tools').onDelete('CASCADE');
    table.primary(['agent_profile_id', 'tool_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('agent_profiles_tools');
}
