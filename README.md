# ForgeComply 360 — Continuous Monitoring Platform

A unified continuous monitoring platform that integrates with **AWS Security Hub**, **Azure Defender**, and **GitHub Dependabot** to provide real-time security findings from all your cloud environments in a single dashboard.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ForgeComply 360 Dashboard                │
│              (React + TypeScript + Recharts)                │
├─────────────────────────────────────────────────────────────┤
│                     REST API (Express)                      │
├──────────┬──────────────┬──────────────┬────────────────────┤
│ Findings │ Integrations │  Dashboard   │     Webhooks       │
│ Service  │   Service    │   Service    │     Handler        │
├──────────┴──────────────┴──────────────┴────────────────────┤
│                    Engine Interface                          │
├──────────────┬─────────────────┬────────────────────────────┤
│ AWS Security │  Azure Defender │  GitHub Dependabot          │
│  Hub Engine  │    Engine       │     Engine                  │
├──────────────┴─────────────────┴────────────────────────────┤
│  Polling Scheduler (node-cron)  │  SQLite (better-sqlite3)  │
└─────────────────────────────────┴───────────────────────────┘
```

## Features

- **Unified Findings Model** — All findings from AWS, Azure, and GitHub are normalized into a common schema for consistent querying and display.
- **Dual Ingestion Paths**:
  - **API Polling** — Scheduled `node-cron` jobs periodically fetch findings from each provider's API.
  - **Webhooks** — Receive real-time alerts via HTTP endpoints for instant updates.
- **Dashboard** — Severity breakdown charts, findings trend over 30 days, integration health status, and key metrics.
- **Findings Explorer** — Full-featured table with filtering by severity, provider, status, and free-text search. Sortable columns and pagination.
- **Integration Management** — Add, edit, test, and remove provider integrations through the UI. Credentials are encrypted at rest.
- **Extensible Engine Pattern** — Each provider implements `IIntegrationEngine` with `pull()`, `testConnection()`, and `parseWebhook()` methods. Adding a new provider (e.g., GCP SCC, Snyk) requires one new engine directory.

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Development

```bash
# Install dependencies
npm install

# Start backend + frontend in dev mode
npm run dev
```

- Backend: http://localhost:3001
- Frontend: http://localhost:5173 (proxies API to backend)
- Health check: http://localhost:3001/health

### Production (Docker)

```bash
# Build and run
docker compose up -d

# Access the application
open http://localhost:3001
```

## Configuration

Copy `.env.example` to `.env` and configure your provider credentials:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3001) |
| `ENCRYPTION_KEY` | AES-256 key for encrypting credentials at rest |
| `AWS_ACCESS_KEY_ID` | AWS access key for Security Hub |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |
| `AWS_REGION` | AWS region (default: us-east-1) |
| `AZURE_TENANT_ID` | Azure AD tenant ID |
| `AZURE_CLIENT_ID` | Azure AD app client ID |
| `AZURE_CLIENT_SECRET` | Azure AD app client secret |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID |
| `GITHUB_TOKEN` | GitHub personal access token (needs `security_events` scope) |
| `GITHUB_WEBHOOK_SECRET` | Secret for validating GitHub webhook payloads |
| `DEFAULT_POLL_INTERVAL` | Default polling interval in minutes (default: 15) |

## API Endpoints

### Findings
- `GET /api/findings` — List findings (supports pagination, filtering, sorting)
- `GET /api/findings/:id` — Get a single finding with full details and raw payload

### Integrations
- `GET /api/integrations` — List all integrations
- `POST /api/integrations` — Create a new integration
- `PUT /api/integrations/:id` — Update an integration
- `DELETE /api/integrations/:id` — Delete an integration
- `POST /api/integrations/:id/test` — Test integration connectivity
- `POST /api/integrations/:id/poll` — Trigger an immediate poll
- `POST /api/integrations/test` — Test credentials before saving

### Dashboard
- `GET /api/dashboard/summary` — Aggregated stats, severity breakdown, trends, integration health

### Webhooks
- `POST /api/webhooks/aws` — Receive AWS Security Hub findings (EventBridge/SNS)
- `POST /api/webhooks/azure` — Receive Azure Defender alerts (Action Groups)
- `POST /api/webhooks/github` — Receive GitHub Dependabot alerts (webhook events)

## Project Structure

```
├── shared/                  # Shared TypeScript types & constants
│   └── src/types/           # UnifiedFinding, IntegrationConfig, Severity, etc.
├── backend/
│   └── src/
│       ├── engines/         # Integration engines (one per provider)
│       │   ├── aws-security-hub/    # AWS client, normalizer, engine
│       │   ├── azure-defender/      # Azure client, normalizer, engine
│       │   └── github-dependabot/   # GitHub client, normalizer, engine
│       ├── routes/          # Express route handlers
│       ├── services/        # Business logic layer
│       ├── webhooks/        # Webhook authentication & parsing
│       ├── scheduler/       # node-cron job management
│       ├── db/              # SQLite schema & connection
│       └── utils/           # Logging, encryption, pagination
├── frontend/
│   └── src/
│       ├── pages/           # Dashboard, Findings, Integrations
│       ├── components/      # Charts, tables, layout
│       ├── hooks/           # TanStack Query hooks
│       └── api/             # Typed API client
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## Adding a New Provider

1. Create a directory under `backend/src/engines/<provider-name>/`
2. Implement the `IIntegrationEngine` interface:
   - `pull(config)` — Fetch findings from the API
   - `testConnection(config)` — Validate credentials
   - `parseWebhook(payload, headers)` — Normalize incoming webhook payloads
3. Add the provider to `SourceProvider` enum in `shared/src/types/source.ts`
4. Register the engine in `backend/src/engines/registry.ts`
5. Add a webhook route in `backend/src/routes/webhooks.routes.ts`

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, better-sqlite3, node-cron, Winston
- **Frontend**: React 18, TypeScript, Vite, Recharts, TanStack Query, React Router
- **Database**: SQLite with WAL mode
- **Deployment**: Docker, Docker Compose
