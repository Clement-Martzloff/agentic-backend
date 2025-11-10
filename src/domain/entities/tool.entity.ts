import { ToolName } from '@/domain/constants/tool.constant.js';

export interface ToolEntity {
  id: string;
  name: ToolName;
  description?: string;
}
