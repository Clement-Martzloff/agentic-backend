import { AGENT_PROFILE_NAMES } from '@/domain/constants/agent-profile.constant.js';
import { AgentServiceFactory } from '@/domain/factories/agent-service.factory.js';
import { ConversationnalAgentService } from '@/domain/services/conversational-agent.service.js';
import { WeatherForecastAgentService } from '@/infrastructure/conversational-agent/weather-forecast-agent.service.js';

type AgentConstructor = new (...args: unknown[]) => ConversationnalAgentService;

export class ConversationnalAgentServiceFactory
  implements AgentServiceFactory<ConversationnalAgentService>
{
  private conversationalAgents: Record<string, AgentConstructor> = {
    [AGENT_PROFILE_NAMES.WEATHER_FORECAST]: WeatherForecastAgentService,
  };

  create(name: string, ...args: unknown[]): ConversationnalAgentService {
    const AgentClass = this.conversationalAgents[name];
    if (!AgentClass) {
      throw new Error(`Conversational agent "${name}" not found.`);
    }
    return new AgentClass(...(args as unknown[]));
  }
}

export const agentFactory = new ConversationnalAgentServiceFactory();
