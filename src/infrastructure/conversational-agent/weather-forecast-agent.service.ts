import { AIMessage, BaseMessage, HumanMessage, ToolMessage } from '@langchain/core/messages';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { createAgent, initChatModel, tool } from 'langchain';
import * as z from 'zod';

import { TOOL_NAMES } from '@/domain/constants/tool.constant.js';
import {
  ConversationnalAgentService,
  Message,
} from '@/domain/services/conversational-agent.service.js';

const systemPrompt = `
  You are an **weather forecaster expert**, who speaks in puns.

  You have access to **one tool**:

  - **${TOOL_NAMES.GET_CURRENT_WEATHER}**: use this to get the weather for a specific location

  If a user asks you for the weather, make sure you know the location.
`;

const getWeather = tool(({ city }: { city: string }) => `It's always sunny in ${city}!`, {
  name: TOOL_NAMES.GET_CURRENT_WEATHER,
  description: 'Get the weather for a given city',
  schema: z.object({
    city: z.string(),
  }),
});

export class WeatherForecastAgentService implements ConversationnalAgentService {
  private checkpointer?: PostgresSaver;

  public async getResponse(conversationId: string, messageContent: string): Promise<Message[]> {
    const checkpointer = await this.getCheckpointer();
    const chatModel = await this.getModel();

    const reactAgent = createAgent({
      model: chatModel,
      systemPrompt,
      tools: [getWeather],
      checkpointer,
    });

    const config = {
      configurable: { thread_id: conversationId },
    };

    const response = await reactAgent.invoke(
      { messages: [new HumanMessage({ content: messageContent })] },
      config,
    );

    return response.messages.map(this.mapMessage);
  }

  private async getModel() {
    return initChatModel('gpt-4.1', { temperature: 0 });
  }

  private async getCheckpointer(): Promise<PostgresSaver> {
    if (!this.checkpointer) {
      // Lazy initialization, runs table migrations if not done yet
      const saver = PostgresSaver.fromConnString(process.env.DATABASE_URL!);
      await saver.setup();
      this.checkpointer = saver;
    }
    return this.checkpointer;
  }

  private mapMessage(msg: BaseMessage): Message {
    const content = typeof msg.content === 'string' ? msg.content : undefined;

    let role: Message['role'];

    if (AIMessage.isInstance(msg)) {
      role = 'assistant';
    } else if (HumanMessage.isInstance(msg)) {
      role = 'user';
    } else if (ToolMessage.isInstance(msg)) {
      role = 'tool';
    } else {
      throw new Error(`Unhandled message type: ${msg.type}`);
    }

    const mapped: Message = { role, content };

    if (role === 'assistant') {
      const toolCalls = (msg as AIMessage).tool_calls;
      if (Array.isArray(toolCalls) && toolCalls.length > 0) {
        mapped.isToolCall = true;
      }
    }

    return mapped;
  }
}
