export type ScenarioId =
  | 'PAYMENT_DEPLOYMENT_REGRESSION'
  | 'ORDERS_REDIS_FAILURE'
  | 'USERS_AUTH_DEPLOYMENT'
  | 'DATABASE_CONNECTION_EXHAUSTION';

export interface ScenarioInfo {
  id: ScenarioId;
  name: string;
}

export const scenarios: ScenarioInfo[] = [
  { id: 'PAYMENT_DEPLOYMENT_REGRESSION', name: 'Payment deployment regression' },
  { id: 'ORDERS_REDIS_FAILURE', name: 'Orders Redis failure' },
  { id: 'USERS_AUTH_DEPLOYMENT', name: 'Users authentication deployment' },
  { id: 'DATABASE_CONNECTION_EXHAUSTION', name: 'Database connection exhaustion' }
];

export function isScenarioId(value: string): value is ScenarioId {
  return scenarios.some(s => s.id === value);
}
