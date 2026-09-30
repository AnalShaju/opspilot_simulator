export interface LogEntry {
  timestamp: string;
  service: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
}

/** Baseline healthy logs present at reset (includes deployment activation markers as evidence). */
export const initialLogs: LogEntry[] = [
  { timestamp: '14:28:01', service: 'Payment Service', level: 'INFO', message: 'Payment request processed successfully' },
  { timestamp: '14:28:03', service: 'Payment Service', level: 'INFO', message: 'Payment request processed successfully' },
  { timestamp: '14:28:05', service: 'Payment Service', level: 'INFO', message: 'Payment request processed successfully' },
  { timestamp: '14:29:12', service: 'API Gateway', level: 'INFO', message: 'Route /api/v1/checkout -> Payment Service OK' },
  { timestamp: '14:30:00', service: 'Payment Service', level: 'INFO', message: 'Deployment v1.8.4 activated successfully' },
  { timestamp: '14:35:10', service: 'Orders Service', level: 'INFO', message: 'Order created successfully' },
  { timestamp: '14:38:00', service: 'Redis', level: 'INFO', message: 'Redis cluster healthy' },
  { timestamp: '15:05:22', service: 'Users Service', level: 'INFO', message: 'Authentication request successful' },
  { timestamp: '15:10:00', service: 'Users Service', level: 'INFO', message: 'Deployment v2.3.0 activated' },
  { timestamp: '15:11:05', service: 'Database', level: 'INFO', message: 'Connection pool usage 22%' },
  { timestamp: '16:05:00', service: 'Database', level: 'INFO', message: 'Connection pool usage 24%' }
];

export const paymentFailureLogs: LogEntry[] = [
  { timestamp: '14:32:10', service: 'Payment Service', level: 'ERROR', message: 'Payment request failed' },
  { timestamp: '14:32:11', service: 'Payment Service', level: 'ERROR', message: 'Payment request timeout' },
  { timestamp: '14:32:12', service: 'Payment Service', level: 'ERROR', message: 'Payment request failed' },
  { timestamp: '14:32:13', service: 'Payment Service', level: 'ERROR', message: 'Payment request timeout' },
  { timestamp: '14:32:14', service: 'Payment Service', level: 'ERROR', message: 'Payment request failed' }
];

export const paymentRollbackLogs: LogEntry[] = [
  { timestamp: '14:33:20', service: 'Payment Service', level: 'INFO', message: 'Deployment v1.8.3 restored' },
  { timestamp: '14:33:21', service: 'Payment Service', level: 'INFO', message: 'Payment service healthy' },
  { timestamp: '14:33:22', service: 'Payment Service', level: 'INFO', message: 'Payment requests processing normally' }
];

export const redisFailureLogs: LogEntry[] = [
  { timestamp: '14:40:00', service: 'Redis', level: 'INFO', message: 'Failover initiated' },
  { timestamp: '14:41:00', service: 'Redis', level: 'WARN', message: 'Replica promotion in progress' },
  { timestamp: '14:41:10', service: 'Orders Service', level: 'ERROR', message: 'Redis connection timeout' },
  { timestamp: '14:42:00', service: 'Orders Service', level: 'WARN', message: 'Request latency increased' },
  { timestamp: '14:42:15', service: 'Orders Service', level: 'ERROR', message: 'Redis connection timeout' }
];

export const redisRecoveryLogs: LogEntry[] = [
  { timestamp: '14:45:00', service: 'Redis', level: 'INFO', message: 'Redis restart initiated' },
  { timestamp: '14:45:05', service: 'Redis', level: 'INFO', message: 'Redis cluster healthy' },
  { timestamp: '14:45:10', service: 'Orders Service', level: 'INFO', message: 'Redis connection restored' },
  { timestamp: '14:45:12', service: 'Orders Service', level: 'INFO', message: 'Order requests processing normally' }
];

export const usersFailureLogs: LogEntry[] = [
  { timestamp: '15:12:01', service: 'Users Service', level: 'ERROR', message: 'Authentication token validation failed' },
  { timestamp: '15:12:02', service: 'Users Service', level: 'ERROR', message: 'Authentication request rejected' },
  { timestamp: '15:12:05', service: 'Users Service', level: 'ERROR', message: 'Authentication token validation failed' },
  { timestamp: '15:12:08', service: 'Users Service', level: 'ERROR', message: 'Authentication request rejected' }
];

export const usersRollbackLogs: LogEntry[] = [
  { timestamp: '15:14:00', service: 'Users Service', level: 'INFO', message: 'Deployment v2.2.1 restored' },
  { timestamp: '15:14:02', service: 'Users Service', level: 'INFO', message: 'Authentication requests processing normally' }
];

export const databaseFailureLogs: LogEntry[] = [
  { timestamp: '16:20:00', service: 'Database', level: 'WARN', message: 'Connection pool usage 90%' },
  { timestamp: '16:21:00', service: 'Database', level: 'WARN', message: 'Connection pool usage 98%' },
  { timestamp: '16:22:00', service: 'Database', level: 'ERROR', message: 'Connection pool exhausted' },
  { timestamp: '16:22:05', service: 'Payment Service', level: 'ERROR', message: 'Database connection timeout' },
  { timestamp: '16:22:06', service: 'Orders Service', level: 'ERROR', message: 'Database connection timeout' }
];

export const databaseRecoveryLogs: LogEntry[] = [
  { timestamp: '16:25:00', service: 'Database', level: 'INFO', message: 'Connection pool reset completed' },
  { timestamp: '16:25:05', service: 'Database', level: 'INFO', message: 'Connection pool usage 20%' },
  { timestamp: '16:25:10', service: 'Payment Service', level: 'INFO', message: 'Database connection restored' },
  { timestamp: '16:25:11', service: 'Orders Service', level: 'INFO', message: 'Database connection restored' }
];
