# OpsPilot Production Simulator

Fake production environment for the OpsPilot AI Incident Response hackathon.

This is **not** OpsPilot. It exposes deterministic production evidence and remediation actions only. OpsPilot/DeepSeek performs investigation and root-cause analysis.

## Quick Start

```bash
npm install
npm run build
npm start
```

- **Local:** `http://localhost:3001`
- **Bind:** `0.0.0.0` (network accessible)
- **Port:** override with `PORT`

## Scenarios

| ID | Name | Remediation |
|----|------|-------------|
| `PAYMENT_DEPLOYMENT_REGRESSION` | Payment deployment regression | `POST /actions/rollback` `{ "version": "v1.8.4" }` |
| `ORDERS_REDIS_FAILURE` | Orders Redis failure | `POST /actions/restart-redis` |
| `USERS_AUTH_DEPLOYMENT` | Users authentication deployment | `POST /actions/rollback` `{ "service": "Users Service", "version": "v2.3.0" }` |
| `DATABASE_CONNECTION_EXHAUSTION` | Database connection exhaustion | `POST /actions/recover-database` |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/scenarios` | List scenario IDs |
| POST | `/simulate/:scenarioId` | Apply a deterministic scenario |
| GET | `/services` | Service statuses |
| GET | `/logs` | Application logs |
| GET | `/metrics` | Metrics snapshot |
| GET | `/deployments` | Deployment history |
| GET | `/incidents` | Historical + active incidents |
| POST | `/actions/rollback` | Rollback a known deployment |
| POST | `/actions/restart-redis` | Recover Redis / Orders |
| POST | `/actions/recover-database` | Recover DB connection pool |
| GET | `/health` | Recovery verification |
| POST | `/reset` | Reset to healthy baseline |

## Test

```bash
node test-flow.js
```

Runs all four scenarios: simulate → verify evidence → remediate → verify recovery.
