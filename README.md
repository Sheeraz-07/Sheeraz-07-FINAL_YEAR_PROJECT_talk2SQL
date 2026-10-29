# Talk2SQL

Talk2SQL is a natural-language analytics application for garment-manufacturing data. Users can ask questions about employees, attendance, inventory, production, and sales, and receive generated SQL, query results, explanations, and visualizations through a web dashboard.

The project is organized as two services:

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, Radix UI, Zustand, Recharts, and Supabase Auth.
- **Backend:** FastAPI and Python. It classifies intent, retrieves database schema, generates SQL with a LongCat-compatible LLM, validates the SQL, executes read-only queries, and returns structured results.

## Features

- Natural-language-to-SQL queries for business data
- English and Urdu query input modes
- Voice input in the query interface
- Read-only SQL execution against Supabase/PostgreSQL or SQL Server
- SQL display, tabular results, execution time, and row counts
- Automatic chart recommendations and visualizations
- Dashboard KPIs, sales and attendance trends, productivity charts, and low-stock alerts
- Query history, favorites, and saved reports stored in Supabase
- User registration, login, password reset, approval workflow, roles, and admin pages
- PDF/XLSX/JSON report export utilities
- Docker and Docker Compose configurations

## Architecture

```text
Browser
  │
  ├── Next.js dashboard (:3000)
  │     ├── Supabase Auth and application data
  │     └── POST /api/query
  │
  └── FastAPI backend (:8000)
        ├── Intent guard
        ├── Schema retrieval and prompt construction
        ├── LongCat-compatible LLM
        ├── SQL safety validator
        └── Read-only database executor
              ├── Supabase/PostgreSQL
              └── SQL Server
```

For a query, the backend first checks whether the request belongs to a supported business domain. It then retrieves the relevant schema, asks the LLM for a query, rejects non-read-only SQL, executes the validated statement, and returns rows, columns, timing, and visualization metadata.

## Requirements

- Node.js 20 or newer
- npm
- Python 3.11 or newer
- PostgreSQL connectivity for Supabase
- Microsoft ODBC Driver 18 for SQL Server if SQL Server queries are enabled
- A LongCat-compatible API key and endpoint

## Local setup

### 1. Clone and install frontend dependencies

```bash
git clone https://github.com/Sheeraz-07/Sheeraz-07-FINAL_YEAR_PROJECT_talk2SQL.git
cd Sheeraz-07-FINAL_YEAR_PROJECT_talk2SQL
npm ci
```

Create `.env.local` in the repository root:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

The frontend also supports optional administrative and email-integration variables used by the approval workflow:

```dotenv
NEXT_PUBLIC_SUPER_ADMIN_EMAIL=admin@example.com
NEXT_PUBLIC_SUPER_ADMIN_PASSWORD=use-a-strong-password
NEXT_PUBLIC_SUPER_ADMIN_NAME=Super Admin
SUPABASE_APPROVAL_EMAIL_FUNCTION_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/approval-email
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Do not expose a service-role key to browser code in a production deployment. Keep privileged values server-side.

### 2. Configure and run the backend

```bash
python -m venv .venv
source .venv/bin/activate              # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt
cp backend/.env.example backend/.env   # Windows: copy backend\.env.example backend\.env
```

Fill in `backend/.env` with the required database and LLM settings:

```dotenv
DEBUG=True
CORS_ORIGINS=http://localhost:3000

SUPABASE_DB_URL=postgresql+asyncpg://YOUR_USER:YOUR_PASSWORD@YOUR_HOST:5432/postgres
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

SQLSERVER_DRIVER=ODBC Driver 18 for SQL Server
SQLSERVER_HOST=YOUR_SQLSERVER_HOST
SQLSERVER_PORT=1433
SQLSERVER_DB_NAME=FurnitureFactoryDB
SQLSERVER_USER=your-sqlserver-user
SQLSERVER_PASSWORD=your-sqlserver-password

LONGCAT_API_BASE=https://api.longcat.chat/openai/
LONGCAT_API_KEY=your-longcat-api-key
LONGCAT_MODEL=LongCat-2.0-Preview
```

Start the API from the repository root:

```bash
uvicorn app.main:app --app-dir backend --reload --port 8000
```

The API is available at `http://localhost:8000`. Health status is exposed at [`/health`](http://localhost:8000/health), and interactive OpenAPI documentation is available at [`/docs`](http://localhost:8000/docs).

### 3. Prepare Supabase

Run the SQL scripts in the Supabase SQL editor after the base application tables are available:

1. `supabase_query_history_setup.sql` creates the `query_history` table and row-level security policies.
2. `supabase_reports_setup.sql` creates the `reports` table, the private `report-data` storage bucket, and storage policies.

The application expects a `public.users` table related to Supabase Auth users. The SQL Server connection is intended for the project’s `FurnitureFactoryDB` schema and must contain the business tables referenced by the generated queries.

### 4. Start the frontend

In a second terminal:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful production checks:

```bash
npm run lint
npm run build
```

## Docker Compose

The repository includes a frontend and backend Compose setup:

```bash
docker compose up --build
```

Before starting, create the files referenced by `docker-compose.yml`:

- `.env.local` for the frontend
- `backend/.env` for the backend

The frontend is served on port `3000`; the backend is served on port `8000`. The backend image installs Microsoft ODBC Driver 18 and the Python dependencies required for SQL Server and PostgreSQL access.

## Backend API

### `GET /health`

Returns a service health response:

```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

### `POST /api/query`

Example request:

```json
{
  "user_id": "1",
  "session_id": "a-session-id",
  "query": "Show today's attendance report",
  "database": "supabase"
}
```

`database` can be `supabase` or `sql_server`. Successful responses include generated SQL, rows, columns, row count, execution time, and visualization information. The endpoint accepts a bearer token when the frontend has an authenticated Supabase session.

### `GET /api/analytics`

Returns KPI, chart, and alert data for the selected database and date range. The dashboard uses this endpoint for revenue, orders, fulfillment, attendance, productivity, and low-stock views.

### `POST /api/schema/refresh`

Refreshes the backend’s schema representation after database structure changes.

## SQL safety

Only statements beginning with `SELECT` or `WITH` are eligible for execution. The validator rejects database-mutating statements such as `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, and `TRUNCATE`, as well as comments, system catalog access, and several common injection patterns. Validation happens before the database executor is called.

This safeguard is not a replacement for database permissions. Production database credentials should have the minimum privileges required for read-only analytics.

## Project layout

```text
backend/app/
  agents/       Intent classification, SQL generation, and validation
  analytics/    KPI and visualization generation
  api/          FastAPI query and analytics routes
  core/         Settings, LLM client, and security helpers
  db/           Supabase and SQL Server adapters
  schema/       Schema normalization and retrieval
  utils/        Prompt and SQL helpers

src/
  app/          Next.js routes, auth, dashboard, query, analytics, and reports
  components/   Query, report, layout, and reusable UI components
  lib/          Supabase clients, auth, exports, and report utilities
  stores/       Zustand application state
  types/        Shared frontend types

supabase/
  functions/    Supabase Edge Functions, including approval email delivery
```

## Development notes

- Keep secrets in ignored `.env` files; use `backend/.env.example` as the backend template.
- The backend currently uses direct database schema retrieval and SQLAlchemy Core rather than ORM models.
- Query history and reports are protected with Supabase row-level security policies.
- Keep database credentials read-only wherever possible.

## License

No license file is currently included in this repository.
