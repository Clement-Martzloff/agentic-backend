import 'dotenv/config';

import type { Knex } from 'knex';
import knex from 'knex';

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is not set. Please provide it in your .env file.',
  );
}

const config: Knex.Config = {
  client: 'pg',
  connection: process.env.DATABASE_URL,
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    directory: './src/infrastructure/database/knex/migrations',
    extension: 'ts',
  },
  seeds: {
    directory: './src/infrastructure/database/knex/seeds',
    extension: 'ts',
  },
};

const db = knex(config);

export { db };
