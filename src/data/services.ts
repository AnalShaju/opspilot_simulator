export interface Service {
  name: string;
  status: 'healthy' | 'degraded' | 'failing' | 'unhealthy';
  version?: string;
  description: string;
}

export const initialServices: Service[] = [
  {
    name: 'API Gateway',
    status: 'healthy',
    version: 'v2.1.0',
    description: 'Public entry point routing traffic to backend services'
  },
  {
    name: 'Users Service',
    status: 'healthy',
    version: 'v2.3.0',
    description: 'Handles authentication and user profiles'
  },
  {
    name: 'Orders Service',
    status: 'healthy',
    version: 'v3.0.1',
    description: 'Manages order creation and fulfillment'
  },
  {
    name: 'Payment Service',
    status: 'healthy',
    version: 'v1.8.4',
    description: 'Processes payment transactions'
  },
  {
    name: 'Database',
    status: 'healthy',
    description: 'Primary transactional database'
  },
  {
    name: 'Redis',
    status: 'healthy',
    description: 'Cache and session store used by Orders Service'
  }
];
