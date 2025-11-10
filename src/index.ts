/* eslint-disable simple-import-sort/imports */
import 'dotenv/config'; // must be first
/* eslint-enable simple-import-sort/imports */
import { buildServer } from '@/infrastructure/http/fastify-server.js';

async function main() {
  const server = await buildServer();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  try {
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening on http://localhost:${port}`);
    console.log(`Swagger UI available at http://localhost:${port}/documentation`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
