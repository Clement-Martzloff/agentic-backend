export const TOOL_NAMES = {
  GET_CURRENT_WEATHER: 'get-weather-for-location',
  // Add other tools here in the future, e.g.:
  // SEND_EMAIL: 'send-email',
} as const;

export type ToolName = (typeof TOOL_NAMES)[keyof typeof TOOL_NAMES];
