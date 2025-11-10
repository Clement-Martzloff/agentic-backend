export const AGENT_PROFILE_NAMES = {
  WEATHER_FORECAST: 'weather-forecast',
  // Add other agents here in the future
  // CUSTOMER_SUPPORT: 'customer-support',
} as const;

export type AgentProfileName = (typeof AGENT_PROFILE_NAMES)[keyof typeof AGENT_PROFILE_NAMES];
