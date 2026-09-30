const BASE_URL = process.env.TEST_URL || 'http://localhost:3001';

async function get(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  const data = await res.json();
  return { res, data };
}

async function post(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  return { res, data };
}

async function runTest() {
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    console.log(`OpsPilot multi-scenario flow test → ${BASE_URL}\n`);

    // ---------- SCENARIO 1: Payment ----------
    console.log('--- PAYMENT_DEPLOYMENT_REGRESSION ---');
    await post('/reset');
    {
      const sim = await post('/simulate/PAYMENT_DEPLOYMENT_REGRESSION');
      assert(sim.res.status === 200, 'S1 simulate');

      const services = await get('/services');
      const payment = services.data.services.find(s => s.name === 'Payment Service');
      const othersOk = services.data.services
        .filter(s => s.name !== 'Payment Service')
        .every(s => s.status === 'healthy');
      assert(payment.status === 'failing' && othersOk, 'S1 Payment failing, others healthy');

      const metrics = await get('/metrics');
      assert(
        metrics.data.payment.errorRate === 82 &&
          metrics.data.payment.successRate === 18 &&
          metrics.data.payment.latency === 2400,
        'S1 payment metrics'
      );

      const logs = await get('/logs');
      assert(
        logs.data.logs.some(l => l.message.includes('Deployment v1.8.4 activated')) &&
          logs.data.logs.some(l => l.level === 'ERROR' && l.message.includes('Payment request failed')),
        'S1 evidence logs'
      );

      const deps = await get('/deployments');
      assert(
        deps.data.deployments.some(d => d.version === 'v1.8.4' && d.status === 'active'),
        'S1 v1.8.4 still active'
      );

      const incidents = await get('/incidents');
      const active = incidents.data.incidents.find(i => i.id === 'INC-001');
      assert(active?.status === 'open' && active?.scenario === 'PAYMENT_DEPLOYMENT_REGRESSION', 'S1 INC-001 open');

      const rb = await post('/actions/rollback', { version: 'v1.8.4' });
      assert(rb.res.status === 200 && rb.data.success, 'S1 rollback');

      const health = await get('/health');
      assert(health.data.recovered === true && health.data.services['Payment Service'] === 'healthy', 'S1 recovered');
    }

    // ---------- SCENARIO 2: Redis ----------
    console.log('\n--- ORDERS_REDIS_FAILURE ---');
    await post('/reset');
    {
      const sim = await post('/simulate/ORDERS_REDIS_FAILURE');
      assert(sim.res.status === 200, 'S2 simulate');

      const services = await get('/services');
      const orders = services.data.services.find(s => s.name === 'Orders Service');
      const redis = services.data.services.find(s => s.name === 'Redis');
      const payment = services.data.services.find(s => s.name === 'Payment Service');
      const db = services.data.services.find(s => s.name === 'Database');
      assert(
        orders.status === 'degraded' &&
          redis.status === 'unhealthy' &&
          payment.status === 'healthy' &&
          db.status === 'healthy',
        'S2 Orders degraded, Redis unhealthy, Payment/DB healthy'
      );

      const metrics = await get('/metrics');
      assert(
        metrics.data.orders.latency === 2800 && metrics.data.orders.errorRate === 4,
        'S2 orders metrics'
      );

      const logs = await get('/logs');
      assert(
        logs.data.logs.some(l => l.service === 'Redis' && l.message.includes('Failover')) &&
          logs.data.logs.some(l => l.service === 'Orders Service' && l.message.includes('Redis connection timeout')),
        'S2 redis/orders logs'
      );

      const deps = await get('/deployments');
      const ordersDep = deps.data.deployments.find(d => d.service === 'Orders Service' && d.status === 'active');
      assert(ordersDep && ordersDep.deployedAt === '08:00', 'S2 no recent Orders deployment');

      const fix = await post('/actions/restart-redis');
      assert(fix.res.status === 200 && fix.data.success, 'S2 restart redis');

      const health = await get('/health');
      assert(
        health.data.recovered === true &&
          health.data.services.Redis === 'healthy' &&
          health.data.services['Orders Service'] === 'healthy' &&
          health.data.metrics.orders.latency === 180,
        'S2 recovered'
      );
    }

    // ---------- SCENARIO 3: Users Auth ----------
    console.log('\n--- USERS_AUTH_DEPLOYMENT ---');
    await post('/reset');
    {
      const sim = await post('/simulate/USERS_AUTH_DEPLOYMENT');
      assert(sim.res.status === 200, 'S3 simulate');

      const services = await get('/services');
      const users = services.data.services.find(s => s.name === 'Users Service');
      assert(
        users.status === 'failing' &&
          services.data.services.filter(s => s.name !== 'Users Service').every(s => s.status === 'healthy'),
        'S3 Users failing, others healthy'
      );

      const metrics = await get('/metrics');
      assert(metrics.data.users.authErrorRate === 76, 'S3 auth error rate 76%');

      const logs = await get('/logs');
      assert(
        logs.data.logs.some(l => l.message.includes('Deployment v2.3.0 activated')) &&
          logs.data.logs.some(l => l.message.includes('Authentication token validation failed')),
        'S3 users evidence logs'
      );

      const rb = await post('/actions/rollback', { service: 'Users Service', version: 'v2.3.0' });
      assert(rb.res.status === 200 && rb.data.success, 'S3 rollback users');

      const deps = await get('/deployments');
      assert(
        deps.data.deployments.find(d => d.version === 'v2.3.0').status === 'rolled_back' &&
          deps.data.deployments.find(d => d.version === 'v2.2.1').status === 'active',
        'S3 deployment statuses updated'
      );

      const health = await get('/health');
      assert(
        health.data.recovered === true &&
          health.data.services['Users Service'] === 'healthy' &&
          health.data.metrics.users.authErrorRate === 1,
        'S3 recovered'
      );
    }

    // ---------- SCENARIO 4: Database ----------
    console.log('\n--- DATABASE_CONNECTION_EXHAUSTION ---');
    await post('/reset');
    {
      const sim = await post('/simulate/DATABASE_CONNECTION_EXHAUSTION');
      assert(sim.res.status === 200, 'S4 simulate');

      const services = await get('/services');
      const db = services.data.services.find(s => s.name === 'Database');
      const payment = services.data.services.find(s => s.name === 'Payment Service');
      const orders = services.data.services.find(s => s.name === 'Orders Service');
      const users = services.data.services.find(s => s.name === 'Users Service');
      assert(
        db.status === 'degraded' &&
          payment.status === 'degraded' &&
          orders.status === 'degraded' &&
          users.status === 'healthy',
        'S4 multi-service impact, Users healthy'
      );

      const metrics = await get('/metrics');
      assert(
        metrics.data.database.latency === 2400 &&
          metrics.data.database.connectionsUsed === 100 &&
          metrics.data.database.connectionsMax === 100,
        'S4 database pool exhausted'
      );

      const logs = await get('/logs');
      assert(
        logs.data.logs.some(l => l.message.includes('Connection pool exhausted')) &&
          logs.data.logs.some(l => l.service === 'Payment Service' && l.message.includes('Database connection timeout')) &&
          logs.data.logs.some(l => l.service === 'Orders Service' && l.message.includes('Database connection timeout')),
        'S4 database evidence logs'
      );

      const fix = await post('/actions/recover-database');
      assert(fix.res.status === 200 && fix.data.success, 'S4 recover database');

      const health = await get('/health');
      assert(
        health.data.recovered === true &&
          health.data.services.Database === 'healthy' &&
          health.data.services['Payment Service'] === 'healthy' &&
          health.data.services['Orders Service'] === 'healthy' &&
          health.data.metrics.database.latency === 120 &&
          health.data.metrics.database.connectionsUsed < 100,
        'S4 recovered'
      );
    }

    // Final reset
    await post('/reset');
    const finalHealth = await get('/health');
    assert(finalHealth.data.recovered === false && !finalHealth.data.activeScenario, 'Final reset clean');

    const scenarioList = await get('/scenarios');
    assert(scenarioList.res.status === 200 && scenarioList.data.length === 4, 'GET /scenarios returns 4');

    console.log(`\nSummary: ${passed} passed, ${failed} failed.`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTest();
