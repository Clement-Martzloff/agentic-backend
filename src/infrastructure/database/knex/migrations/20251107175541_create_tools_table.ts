import type { Knex } from 'knex';

import { TOOL_NAMES } from '@/domain/constants/tool.constant.js';

const TOOL_NAME_ENUM = 'tool_name_enum';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `CREATE TYPE ${TOOL_NAME_ENUM} AS ENUM (${Object.values(TOOL_NAMES)
      .map((name) => `'${name}'`)
      .join(', ')})`,
  );

  return knex.schema.createTable('tools', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    table.specificType('name', TOOL_NAME_ENUM).notNullable().unique();

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('tools');
  await knex.raw(`DROP TYPE ${TOOL_NAME_ENUM}`);
}
