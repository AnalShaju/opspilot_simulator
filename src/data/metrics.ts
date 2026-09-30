export interface Metrics {
  payment: {
    errorRate: number;
    successRate: number;
    latency: number;
  };
  orders: {
    errorRate: number;
    latency: number;
    status: string;
  };
  users: {
    authErrorRate: number;
    status: string;
  };
  database: {
    status: string;
    errorRate: number;
    latency: number;
    connectionsUsed: number;
    connectionsMax: number;
  };
  redis: {
    status: string;
  };
}

export const initialMetrics: Metrics = {
  payment: {
    errorRate: 1,
    successRate: 99,
    latency: 180
  },
  orders: {
    errorRate: 1,
    latency: 180,
    status: 'healthy'
  },
  users: {
    authErrorRate: 1,
    status: 'healthy'
  },
  database: {
    status: 'healthy',
    errorRate: 1,
    latency: 120,
    connectionsUsed: 22,
    connectionsMax: 100
  },
  redis: {
    status: 'healthy'
  }
};
