import type { Knex } from 'knex';

import { AGENT_PROFILE_NAMES } from '@/domain/constants/agent-profile.constant.js';
import { TOOL_NAMES } from '@/domain/constants/tool.constant.js';

export async function seed(knex: Knex): Promise<void> {
  const weatherAgentProfileName = AGENT_PROFILE_NAMES.WEATHER_FORECAST;
  const weatherToolName = TOOL_NAMES.GET_CURRENT_WEATHER;

  const existingAgent = await knex('agent_profiles')
    .where({ name: weatherAgentProfileName })
    .first();
  if (existingAgent) {
    console.log(`Agent profile "${weatherAgentProfileName}" already exists. Skipping seed.`);
    return;
  }

  console.log(
    `Seeding initial agent profile profile "${weatherAgentProfileName}" and its tools...`,
  );

  try {
    const [tool] = await knex('tools')
      .insert({
        name: weatherToolName,
      })
      .returning('*');

    console.log(`-> Created tool: "${tool.name}" (ID: ${tool.id})`);

    const [agentProfile] = await knex('agent_profiles')
      .insert({
        name: weatherAgentProfileName,
      })
      .returning('*');

    console.log(
      `-> Created agent profile profile: "${agentProfile.name}" (ID: ${agentProfile.id})`,
    );

    await knex('agent_profiles_tools').insert({
      agent_profile_id: agentProfile.id,
      tool_id: tool.id,
    });

    console.log(`-> Linked agent profile "${agentProfile.name}" with tool "${tool.name}".`);
    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error during seeding process:', error);
    throw error;
  }
}
