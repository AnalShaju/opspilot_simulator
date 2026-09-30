import { ScenarioId } from './scenarios';

export interface Incident {
  id: string;
  service: string;
  scenario?: ScenarioId;
  title?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'open' | 'resolved';
  cause?: string;
  action?: string;
  result?: string;
}

/** Historical incidents only — evidence for OpsPilot, no active root-cause fields. */
export const initialIncidents: Incident[] = [
  {
    id: 'INC-000',
    service: 'Payment Service',
    cause: 'Deployment v1.7.9',
    action: 'Rollback',
    result: 'Resolved',
    status: 'resolved'
  },
  {
    id: 'INC-00R',
    service: 'Orders Service',
    cause: 'Redis failover incomplete',
    action: 'Restart Redis',
    result: 'Resolved',
    status: 'resolved'
  }
];

export const scenarioIncidents: Record<ScenarioId, Incident> = {
  PAYMENT_DEPLOYMENT_REGRESSION: {
    id: 'INC-001',
    scenario: 'PAYMENT_DEPLOYMENT_REGRESSION',
    service: 'Payment Service',
    title: 'Payment Service 500 Errors',
    severity: 'critical',
    status: 'open'
  },
  ORDERS_REDIS_FAILURE: {
    id: 'INC-001',
    scenario: 'ORDERS_REDIS_FAILURE',
    service: 'Orders Service',
    title: 'Orders Service Redis Failover Impact',
    severity: 'high',
    status: 'open'
  },
  USERS_AUTH_DEPLOYMENT: {
    id: 'INC-001',
    scenario: 'USERS_AUTH_DEPLOYMENT',
    service: 'Users Service',
    title: 'Users Authentication Failures',
    severity: 'critical',
    status: 'open'
  },
  DATABASE_CONNECTION_EXHAUSTION: {
    id: 'INC-001',
    scenario: 'DATABASE_CONNECTION_EXHAUSTION',
    service: 'Database',
    title: 'Database Connection Pool Exhaustion',
    severity: 'critical',
    status: 'open'
  }
};
