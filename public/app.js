document.addEventListener('DOMContentLoaded', () => {
  const pageTitle = document.getElementById('page-title');
  const toast = document.getElementById('toast');
  const overallStatusBadge = document.getElementById('overall-status-badge');
  const overallStatusText = document.getElementById('overall-status-text');

  const dashboardServices = document.getElementById('dashboard-services');
  const servicesTbody = document.getElementById('services-tbody');
  const metricErrorRate = document.getElementById('metric-error-rate');
  const metricSuccessRate = document.getElementById('metric-success-rate');
  const metricLatency = document.getElementById('metric-latency');
  const metricOrdersLatency = document.getElementById('metric-orders-latency');
  const metricAuthError = document.getElementById('metric-auth-error');
  const metricDbPool = document.getElementById('metric-db-pool');
  const consoleLogs = document.getElementById('console-logs');
  const deploymentsTbody = document.getElementById('deployments-tbody');
  const incidentsTbody = document.getElementById('incidents-tbody');

  const healthFocusLabel = document.getElementById('health-focus-label');
  const healthFocusStatus = document.getElementById('health-focus-status');
  const healthMetricLabel = document.getElementById('health-metric-label');
  const healthMetricValue = document.getElementById('health-metric-value');
  const healthRecovered = document.getElementById('health-recovered');
  const healthScenario = document.getElementById('health-scenario');

  const titles = {
    dashboard: 'Dashboard',
    services: 'Services',
    logs: 'Logs',
    deployments: 'Deployments',
    incidents: 'Incidents'
  };

  function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast toast-${type}`;
    setTimeout(() => {
      toast.className = 'toast hidden';
    }, 3500);
  }

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`view-${view}`).classList.add('active');
      pageTitle.textContent = titles[view] || view;
    });
  });

  async function fetchAllData() {
    await Promise.all([
      fetchServices(),
      fetchMetrics(),
      fetchLogs(),
      fetchDeployments(),
      fetchIncidents(),
      fetchHealth()
    ]);
  }

  async function fetchServices() {
    const res = await fetch('/services');
    const data = await res.json();
    let worst = 'healthy';

    dashboardServices.innerHTML = '';
    servicesTbody.innerHTML = '';

    data.services.forEach(svc => {
      if (svc.status === 'failing' || svc.status === 'unhealthy') worst = 'failing';
      else if (svc.status === 'degraded' && worst === 'healthy') worst = 'degraded';

      const row = document.createElement('div');
      row.className = 'status-row';
      row.innerHTML = `
        <span class="status-name">${svc.name}</span>
        <span class="status-pill status-${svc.status}">${svc.status}</span>
      `;
      dashboardServices.appendChild(row);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${svc.name}</td>
        <td><span class="status-pill status-${svc.status}">${svc.status}</span></td>
        <td>${svc.version ? `<code>${svc.version}</code>` : '—'}</td>
        <td>${svc.description || ''}</td>
      `;
      servicesTbody.appendChild(tr);
    });

    if (worst === 'failing') {
      overallStatusBadge.className = 'badge badge-failing';
      overallStatusText.textContent = 'Incident Active';
    } else if (worst === 'degraded') {
      overallStatusBadge.className = 'badge badge-degraded';
      overallStatusText.textContent = 'System Degraded';
    } else {
      overallStatusBadge.className = 'badge badge-healthy';
      overallStatusText.textContent = 'System Healthy';
    }
  }

  async function fetchMetrics() {
    const res = await fetch('/metrics');
    const metrics = await res.json();
    metricErrorRate.textContent = `${metrics.payment.errorRate}%`;
    metricSuccessRate.textContent = `${metrics.payment.successRate}%`;
    metricLatency.textContent = `${metrics.payment.latency} ms`;
    metricOrdersLatency.textContent = `${metrics.orders.latency} ms`;
    metricAuthError.textContent = `${metrics.users.authErrorRate}%`;
    metricDbPool.textContent = `${metrics.database.connectionsUsed}/${metrics.database.connectionsMax}`;
  }

  async function fetchLogs() {
    const res = await fetch('/logs');
    const data = await res.json();
    consoleLogs.innerHTML = '';
    data.logs.forEach(log => {
      const line = document.createElement('div');
      line.className = 'log-line';
      line.innerHTML = `
        <span class="log-time">${log.timestamp}</span>
        <span class="log-level ${log.level}">${log.level}</span>
        <span class="log-service">[${log.service}]</span>
        <span class="log-msg">${log.message}</span>
      `;
      consoleLogs.appendChild(line);
    });
    consoleLogs.scrollTop = consoleLogs.scrollHeight;
  }

  async function fetchDeployments() {
    const res = await fetch('/deployments');
    const data = await res.json();
    deploymentsTbody.innerHTML = '';
    data.deployments.forEach(dep => {
      const tagClass =
        dep.status === 'active' ? 'tag-active' :
        dep.status === 'rolled_back' ? 'tag-rolledback' : 'tag-previous';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><code>${dep.version}</code></td>
        <td>${dep.service}</td>
        <td>${dep.deployedAt}</td>
        <td><span class="tag ${tagClass}">${dep.status}</span></td>
        <td>${dep.description || ''}</td>
      `;
      deploymentsTbody.appendChild(tr);
    });
  }

  async function fetchIncidents() {
    const res = await fetch('/incidents');
    const data = await res.json();
    incidentsTbody.innerHTML = '';
    data.incidents.forEach(inc => {
      const titleOrCause = inc.title || inc.cause || inc.scenario || '—';
      const severityOrAction = inc.severity || inc.action || '—';
      const statusOrResult = inc.status || inc.result || '—';
      const tagClass = statusOrResult === 'open' ? 'tag-open' : 'tag-resolved';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><code>${inc.id}</code></td>
        <td>${inc.service}</td>
        <td>${titleOrCause}</td>
        <td>${severityOrAction}</td>
        <td><span class="tag ${tagClass}">${statusOrResult}</span></td>
      `;
      incidentsTbody.appendChild(tr);
    });
  }

  async function fetchHealth() {
    const res = await fetch('/health');
    const health = await res.json();
    const services = health.services || {};
    const metrics = health.metrics || {};

    const scenarioNames = {
      PAYMENT_DEPLOYMENT_REGRESSION: 'Payment Deployment',
      ORDERS_REDIS_FAILURE: 'Orders Redis Failure',
      USERS_AUTH_DEPLOYMENT: 'Users Auth Failure',
      DATABASE_CONNECTION_EXHAUSTION: 'Database Connection Failure'
    };

    const focusByScenario = {
      PAYMENT_DEPLOYMENT_REGRESSION: {
        label: 'Payment Status',
        status: services['Payment Service'] || health.paymentService || '—',
        metricLabel: 'Payment Error Rate',
        metricValue: `${metrics.payment?.errorRate ?? health.errorRate ?? '—'}%`
      },
      ORDERS_REDIS_FAILURE: {
        label: 'Redis Status',
        status: services.Redis || metrics.redis?.status || '—',
        metricLabel: 'Orders Latency',
        metricValue: `${metrics.orders?.latency ?? '—'} ms`
      },
      USERS_AUTH_DEPLOYMENT: {
        label: 'Users Status',
        status: services['Users Service'] || metrics.users?.status || '—',
        metricLabel: 'Auth Error Rate',
        metricValue: `${metrics.users?.authErrorRate ?? '—'}%`
      },
      DATABASE_CONNECTION_EXHAUSTION: {
        label: 'Database Status',
        status: services.Database || metrics.database?.status || '—',
        metricLabel: 'DB Pool',
        metricValue: metrics.database
          ? `${metrics.database.connectionsUsed}/${metrics.database.connectionsMax}`
          : '—'
      }
    };

    const focus = focusByScenario[health.activeScenario] || {
      label: 'System Status',
      status: health.recovered ? 'healthy' : 'healthy',
      metricLabel: 'Payment Error Rate',
      metricValue: `${metrics.payment?.errorRate ?? health.errorRate ?? 1}%`
    };

    healthFocusLabel.textContent = focus.label;
    healthFocusStatus.textContent = focus.status;
    healthFocusStatus.className =
      focus.status === 'healthy' ? 'health-val text-ok' : 'health-val text-bad';

    healthMetricLabel.textContent = focus.metricLabel;
    healthMetricValue.textContent = focus.metricValue;

    healthRecovered.textContent = health.recovered ? 'Yes' : 'No';
    healthRecovered.className = health.recovered ? 'health-val text-ok' : 'health-val text-muted';
    healthScenario.textContent = health.activeScenario
      ? (scenarioNames[health.activeScenario] || health.activeScenario)
      : 'None';
  }

  async function postJson(url, body) {
    const res = await fetch(url, {
      method: 'POST',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    return { res, data };
  }

  document.querySelectorAll('.btn-scenario').forEach(btn => {
    btn.addEventListener('click', async () => {
      const scenario = btn.dataset.scenario;
      try {
        const { res, data } = await postJson(`/simulate/${scenario}`);
        if (!res.ok) {
          showToast(data.message || 'Simulation failed', 'error');
        } else {
          showToast(`Started: ${btn.textContent.replace(/^\d+\.\s*/, '')}`, 'error');
        }
        await fetchAllData();
      } catch (err) {
        showToast('Failed to simulate scenario', 'error');
      }
    });
  });

  document.getElementById('btn-rollback-payment').addEventListener('click', async () => {
    try {
      const { res, data } = await postJson('/actions/rollback', { version: 'v1.8.4' });
      showToast(data.message || (res.ok ? 'Rollback ok' : 'Rollback failed'), res.ok ? 'success' : 'error');
      await fetchAllData();
    } catch (err) {
      showToast('Failed to rollback payment', 'error');
    }
  });

  document.getElementById('btn-rollback-users').addEventListener('click', async () => {
    try {
      const { res, data } = await postJson('/actions/rollback', {
        service: 'Users Service',
        version: 'v2.3.0'
      });
      showToast(data.message || (res.ok ? 'Rollback ok' : 'Rollback failed'), res.ok ? 'success' : 'error');
      await fetchAllData();
    } catch (err) {
      showToast('Failed to rollback users', 'error');
    }
  });

  document.getElementById('btn-restart-redis').addEventListener('click', async () => {
    try {
      const { res, data } = await postJson('/actions/restart-redis');
      showToast(data.message || (res.ok ? 'Redis restarted' : 'Restart failed'), res.ok ? 'success' : 'error');
      await fetchAllData();
    } catch (err) {
      showToast('Failed to restart Redis', 'error');
    }
  });

  document.getElementById('btn-recover-db').addEventListener('click', async () => {
    try {
      const { res, data } = await postJson('/actions/recover-database');
      showToast(data.message || (res.ok ? 'Database recovered' : 'Recovery failed'), res.ok ? 'success' : 'error');
      await fetchAllData();
    } catch (err) {
      showToast('Failed to recover database', 'error');
    }
  });

  document.getElementById('btn-reset').addEventListener('click', async () => {
    try {
      await postJson('/reset');
      showToast('Simulator reset to healthy state', 'success');
      await fetchAllData();
    } catch (err) {
      showToast('Failed to reset state', 'error');
    }
  });

  document.getElementById('btn-refresh').addEventListener('click', async () => {
    await fetchAllData();
    showToast('Refreshed from simulator API');
  });

  fetchAllData();
  setInterval(fetchAllData, 5000);
});
