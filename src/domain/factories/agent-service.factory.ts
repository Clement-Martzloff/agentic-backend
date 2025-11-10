export interface AgentServiceFactory<T> {
  create(name: string, ...args: unknown[]): T;
}
