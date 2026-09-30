import { Service, initialServices } from './data/services';
import {
  LogEntry,
  initialLogs,
  paymentFailureLogs,
  paymentRollbackLogs,
  redisFailureLogs,
  redisRecoveryLogs,
  usersFailureLogs,
  usersRollbackLogs,
  databaseFailureLogs,
  databaseRecoveryLogs
} from './data/logs';
import { Metrics, initialMetrics } from './data/metrics';
import { Deployment, initialDeployments } from './data/deployments';
import { Incident, initialIncidents, scenarioIncidents } from './data/incidents';
import { ScenarioId, isScenarioId } from './data/scenarios';

export type RecoveryStatus = 'none' | 'pending_verification' | 'verified';

export class ProductionState {
  services: Service[] = [];
  logs: LogEntry[] = [];
  metrics: Metrics = JSON.parse(JSON.stringify(initialMetrics));
  deployments: Deployment[] = [];
  incidents: Incident[] = [];
  activeScenario: ScenarioId | null = null;
  recoveryStatus: RecoveryStatus = 'none';
  recovered: boolean = false;

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.services = initialServices.map(s => ({ ...s }));
    this.logs = initialLogs.map(l => ({ ...l }));
    this.metrics = JSON.parse(JSON.stringify(initialMetrics));
    this.deployments = initialDeployments.map(d => ({ ...d }));
    this.incidents = initialIncidents.map(i => ({ ...i }));
    this.activeScenario = null;
    this.recoveryStatus = 'none';
    this.recovered = false;
  }

  private setServiceStatus(name: string, status: Service['status'], version?: string): void {
    const svc = this.services.find(s => s.name === name);
    if (!svc) return;
    svc.status = status;
    if (version !== undefined) {
      svc.version = version;
    }
  }

  private openIncident(scenarioId: ScenarioId): void {
    this.incidents = this.incidents.filter(i => i.id !== 'INC-001');
    this.incidents.push({ ...scenarioIncidents[scenarioId] });
  }

  private resolveActiveIncident(action: string): void {
    const active = this.incidents.find(i => i.id === 'INC-001' && i.status === 'open');
    if (active) {
      active.status = 'resolved';
      active.action = action;
      active.result = 'Resolved';
    }
  }

  /**
   * Apply a deterministic scenario. Resets to healthy first so evidence is always identical.
   */
  public simulate(scenarioId: string): { success: boolean; statusCode: number; message: string; scenarioId?: ScenarioId } {
    if (!isScenarioId(scenarioId)) {
      return {
        success: false,
        statusCode: 404,
        message: `Unknown scenario '${scenarioId}'`
      };
    }

    this.reset();
    this.activeScenario = scenarioId;
    this.recovered = false;
    this.recoveryStatus = 'none';
    this.openIncident(scenarioId);

    switch (scenarioId) {
      case 'PAYMENT_DEPLOYMENT_REGRESSION':
        this.applyPaymentFailure();
        break;
      case 'ORDERS_REDIS_FAILURE':
        this.applyRedisFailure();
        break;
      case 'USERS_AUTH_DEPLOYMENT':
        this.applyUsersAuthFailure();
        break;
      case 'DATABASE_CONNECTION_EXHAUSTION':
        this.applyDatabaseExhaustion();
        break;
    }

    return {
      success: true,
      statusCode: 200,
      message: `Scenario ${scenarioId} simulated successfully`,
      scenarioId
    };
  }

  private applyPaymentFailure(): void {
    this.setServiceStatus('Payment Service', 'failing');
    this.metrics.payment = { errorRate: 82, successRate: 18, latency: 2400 };
    this.logs = [...this.logs, ...paymentFailureLogs.map(l => ({ ...l }))];
  }

  private applyRedisFailure(): void {
    this.setServiceStatus('Orders Service', 'degraded');
    this.setServiceStatus('Redis', 'unhealthy');
    this.metrics.orders = { errorRate: 4, latency: 2800, status: 'degraded' };
    this.metrics.redis = { status: 'unhealthy' };
    this.logs = [...this.logs, ...redisFailureLogs.map(l => ({ ...l }))];
  }

  private applyUsersAuthFailure(): void {
    this.setServiceStatus('Users Service', 'failing');
    this.metrics.users = { authErrorRate: 76, status: 'failing' };
    this.logs = [...this.logs, ...usersFailureLogs.map(l => ({ ...l }))];
  }

  private applyDatabaseExhaustion(): void {
    this.setServiceStatus('Database', 'degraded');
    this.setServiceStatus('Payment Service', 'degraded');
    this.setServiceStatus('Orders Service', 'degraded');
    // Users remains healthy (mostly healthy)
    this.metrics.database = {
      status: 'degraded',
      errorRate: 35,
      latency: 2400,
      connectionsUsed: 100,
      connectionsMax: 100
    };
    this.metrics.payment = { errorRate: 28, successRate: 72, latency: 1800 };
    this.metrics.orders = { errorRate: 22, latency: 2100, status: 'degraded' };
    this.logs = [...this.logs, ...databaseFailureLogs.map(l => ({ ...l }))];
  }

  /**
   * Rollback a known deployment. Supports Payment v1.8.4 and Users v2.3.0.
   * Body may include optional service; defaults to Payment Service when omitted.
   */
  public performRollback(version: string, service?: string): {
    success: boolean;
    statusCode: number;
    action?: string;
    version?: string;
    service?: string;
    message: string;
  } {
    const targetService = service || 'Payment Service';

    const deployment = this.deployments.find(
      d => d.version === version && d.service === targetService
    );

    if (!deployment) {
      return {
        success: false,
        statusCode: 400,
        message: `Unknown deployment '${version}' for service '${targetService}'`
      };
    }

    if (deployment.status === 'rolled_back') {
      return {
        success: false,
        statusCode: 400,
        message: `Deployment ${version} is already rolled back`
      };
    }

    if (targetService === 'Payment Service' && version === 'v1.8.4') {
      return this.rollbackPayment();
    }

    if (targetService === 'Users Service' && version === 'v2.3.0') {
      return this.rollbackUsers();
    }

    return {
      success: false,
      statusCode: 400,
      message: `Rollback of ${targetService} ${version} is not supported in this simulator`
    };
  }

  private rollbackPayment() {
    if (this.activeScenario && this.activeScenario !== 'PAYMENT_DEPLOYMENT_REGRESSION') {
      return {
        success: false,
        statusCode: 409,
        message: 'Payment rollback is not applicable to the active scenario'
      };
    }

    this.setServiceStatus('Payment Service', 'healthy', 'v1.8.3');
    this.metrics.payment = { errorRate: 1, successRate: 99, latency: 180 };

    const v184 = this.deployments.find(d => d.version === 'v1.8.4' && d.service === 'Payment Service');
    const v183 = this.deployments.find(d => d.version === 'v1.8.3' && d.service === 'Payment Service');
    if (v184) v184.status = 'rolled_back';
    if (v183) v183.status = 'active';

    this.logs = [...this.logs, ...paymentRollbackLogs.map(l => ({ ...l }))];
    this.resolveActiveIncident('Rollback');
    this.recovered = true;
    this.recoveryStatus = 'verified';
    this.activeScenario = null;

    return {
      success: true,
      statusCode: 200,
      action: 'rollback',
      version: 'v1.8.4',
      service: 'Payment Service',
      message: 'Deployment v1.8.4 rolled back successfully'
    };
  }

  private rollbackUsers() {
    if (this.activeScenario && this.activeScenario !== 'USERS_AUTH_DEPLOYMENT') {
      return {
        success: false,
        statusCode: 409,
        message: 'Users Service rollback is not applicable to the active scenario'
      };
    }

    this.setServiceStatus('Users Service', 'healthy', 'v2.2.1');
    this.metrics.users = { authErrorRate: 1, status: 'healthy' };

    const v230 = this.deployments.find(d => d.version === 'v2.3.0' && d.service === 'Users Service');
    const v221 = this.deployments.find(d => d.version === 'v2.2.1' && d.service === 'Users Service');
    if (v230) v230.status = 'rolled_back';
    if (v221) v221.status = 'active';

    this.logs = [...this.logs, ...usersRollbackLogs.map(l => ({ ...l }))];
    this.resolveActiveIncident('Rollback');
    this.recovered = true;
    this.recoveryStatus = 'verified';
    this.activeScenario = null;

    return {
      success: true,
      statusCode: 200,
      action: 'rollback',
      version: 'v2.3.0',
      service: 'Users Service',
      message: 'Deployment v2.3.0 rolled back successfully'
    };
  }

  public restartRedis(): { success: boolean; statusCode: number; message: string; action?: string } {
    if (this.activeScenario && this.activeScenario !== 'ORDERS_REDIS_FAILURE') {
      return {
        success: false,
        statusCode: 409,
        message: 'Redis restart is not applicable to the active scenario. Simulate ORDERS_REDIS_FAILURE first.'
      };
    }

    const redis = this.services.find(s => s.name === 'Redis');
    if (!redis || redis.status === 'healthy') {
      // Allow recovery if scenario marks unhealthy/degraded orders
      if (!this.activeScenario && redis?.status === 'healthy') {
        return {
          success: false,
          statusCode: 409,
          message: 'Redis is already healthy; nothing to restart'
        };
      }
    }

    this.setServiceStatus('Redis', 'healthy');
    this.setServiceStatus('Orders Service', 'healthy');
    this.metrics.redis = { status: 'healthy' };
    this.metrics.orders = { errorRate: 1, latency: 180, status: 'healthy' };
    this.logs = [...this.logs, ...redisRecoveryLogs.map(l => ({ ...l }))];
    this.resolveActiveIncident('Restart Redis');
    this.recovered = true;
    this.recoveryStatus = 'verified';
    this.activeScenario = null;

    return {
      success: true,
      statusCode: 200,
      action: 'restart-redis',
      message: 'Redis restarted and Orders Service recovered'
    };
  }

  public recoverDatabase(): { success: boolean; statusCode: number; message: string; action?: string } {
    if (this.activeScenario && this.activeScenario !== 'DATABASE_CONNECTION_EXHAUSTION') {
      return {
        success: false,
        statusCode: 409,
        message: 'Database recovery is not applicable to the active scenario. Simulate DATABASE_CONNECTION_EXHAUSTION first.'
      };
    }

    const db = this.services.find(s => s.name === 'Database');
    if (!this.activeScenario && db?.status === 'healthy') {
      return {
        success: false,
        statusCode: 409,
        message: 'Database is already healthy; nothing to recover'
      };
    }

    this.setServiceStatus('Database', 'healthy');
    this.setServiceStatus('Payment Service', 'healthy');
    this.setServiceStatus('Orders Service', 'healthy');
    this.metrics.database = {
      status: 'healthy',
      errorRate: 1,
      latency: 120,
      connectionsUsed: 20,
      connectionsMax: 100
    };
    this.metrics.payment = { errorRate: 1, successRate: 99, latency: 180 };
    this.metrics.orders = { errorRate: 1, latency: 180, status: 'healthy' };
    this.logs = [...this.logs, ...databaseRecoveryLogs.map(l => ({ ...l }))];
    this.resolveActiveIncident('Recover Database');
    this.recovered = true;
    this.recoveryStatus = 'verified';
    this.activeScenario = null;

    return {
      success: true,
      statusCode: 200,
      action: 'recover-database',
      message: 'Database connection pool recovered successfully'
    };
  }

  public getHealthSummary() {
    const servicesMap: Record<string, string> = {};
    for (const svc of this.services) {
      servicesMap[svc.name] = svc.status;
    }

    return {
      recovered: this.recovered,
      recoveryStatus: this.recoveryStatus,
      activeScenario: this.activeScenario,
      services: servicesMap,
      metrics: this.metrics,
      // Backward-compatible payment fields for existing UI
      paymentService: servicesMap['Payment Service'] || 'unknown',
      errorRate: this.metrics.payment.errorRate,
      paymentSuccessRate: this.metrics.payment.successRate
    };
  }
}

export const state = new ProductionState();
