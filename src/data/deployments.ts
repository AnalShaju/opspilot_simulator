export interface Deployment {
  version: string;
  service: string;
  deployedAt: string;
  status: 'active' | 'previous' | 'rolled_back';
  description: string;
}

/**
 * Deterministic deployment history.
 * - Payment v1.8.4 at 14:30 supports scenario 1 evidence.
 * - Users v2.3.0 at 15:10 supports scenario 3 evidence.
 * - Orders last deploy is old (08:00) so scenario 2 is not deployment-related.
 * - No app deploy near 16:20 so scenario 4 is not deployment-related.
 */
export const initialDeployments: Deployment[] = [
  {
    version: 'v1.8.4',
    service: 'Payment Service',
    deployedAt: '14:30',
    status: 'active',
    description: 'New gateway retry protocol'
  },
  {
    version: 'v1.8.3',
    service: 'Payment Service',
    deployedAt: '12:10',
    status: 'previous',
    description: 'Hotfix'
  },
  {
    version: 'v1.8.2',
    service: 'Payment Service',
    deployedAt: '09:00',
    status: 'previous',
    description: 'Performance improvements'
  },
  {
    version: 'v2.3.0',
    service: 'Users Service',
    deployedAt: '15:10',
    status: 'active',
    description: 'Auth token validation rewrite'
  },
  {
    version: 'v2.2.1',
    service: 'Users Service',
    deployedAt: '11:00',
    status: 'previous',
    description: 'Session store patch'
  },
  {
    version: 'v3.0.1',
    service: 'Orders Service',
    deployedAt: '08:00',
    status: 'active',
    description: 'Order status workflow update'
  }
];
