export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface Message {
  role: MessageRole;
  content?: string;
  isToolCall?: boolean;
}

export interface ConversationnalAgentService {
  getResponse(conversationId: string, messageContent: string): Promise<Message[]>;
}
