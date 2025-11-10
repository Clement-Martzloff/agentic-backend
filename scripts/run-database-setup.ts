import { db } from '@/infrastructure/database/knex/db.js';

async function runDatabaseSetup() {
  try {
    console.log('🚀 Starting database setup...');

    console.log('Applying migrations...');
    await db.migrate.latest();
    console.log('✅ Migrations applied successfully.');

    console.log('Planting seeds...');
    await db.seed.run();
    console.log('✅ Seeds planted successfully.');

    console.log('🎉 Database setup finished successfully!');
  } catch (error) {
    console.error('❌ Failed to run database setup:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runDatabaseSetup();
