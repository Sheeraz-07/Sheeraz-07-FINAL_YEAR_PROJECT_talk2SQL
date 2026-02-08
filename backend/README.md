# Talk2SQL Backend

> **Agentic, Memory-Driven, Supabase-Compatible NL→SQL Backend**

A production-grade Python backend that converts natural-language questions into safe PostgreSQL queries, executes them on Supabase, and returns structured results with explanations — all while learning and personalising per user over time.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Request Flow](#request-flow)
- [Memory Strategy](#memory-strategy)
- [Schema Ingestion](#schema-ingestion)
- [Directory Structure](#directory-structure)
- [Setup & Installation](#setup--installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Reference](#api-reference)
- [Design Decisions](#design-decisions)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Next.js Frontend                       │
│        POST /api/query { user_id, session_id, query }   │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     FastAPI Backend                       │
│                                                          │
│  1. Intent Guard ──────► Reject out-of-domain queries    │
│  2. Session Memory ────► Load conversation context       │
│  3. User Profile ──────► Load personalisation hints      │
│  4. Schema Retriever ──► Vector search for tables        │
│  5. SQL Agent ─────────► LLM generates PostgreSQL        │
│  6. SQL Validator ─────► Block unsafe SQL                │
│  7. Executor ──────────► Run on Supabase                 │
│  8. Explanation ───────► LLM summarises results          │
│  9. Memory Updater ────► Learn from this query           │
│                                                          │
│  Returns: { sql, data, columns, explanation }            │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 Supabase (PostgreSQL)                     │
│  • Application tables (employees, products, sales…)      │
│  • user_profiles (JSONB personalisation)                 │
│  • vector_embeddings (pgvector for schema + memory)      │
└─────────────────────────────────────────────────────────┘
```

---

## Request Flow

Every `POST /api/query` request follows this exact pipeline:

| Step | Module | Action |
|------|--------|--------|
| 1 | `agents/intent_guard.py` | Two-layer domain check (keywords + LLM fallback). Rejects weather/jokes/chitchat. |
| 2 | `memory/session_memory.py` | Loads conversation turns for follow-up resolution. |
| 3 | `memory/user_profile.py` | Loads JSONB profile; builds personalisation hints. |
| 4 | `schema/schema_retriever.py` | Embeds query → cosine search → retrieves relevant tables only. |
| 5 | `agents/sql_agent.py` | Sends enriched prompt to LongCat LLM → receives raw SQL. |
| 6 | `agents/sql_validator.py` | Blocks DROP/ALTER/DELETE/INSERT; checks parentheses, multi-statement. |
| 7 | `db/executor.py` | Executes validated SELECT via SQLAlchemy Core on Supabase. |
| 8 | `db/executor.py` | Generates a 1–3 sentence explanation via LLM. |
| 9 | `memory/memory_updater.py` | Updates structured profile + stores behavioural embedding. |

---

## Memory Strategy

### Session Memory (Short-Term)

- **Storage**: In-memory dict (Redis-ready protocol abstraction)
- **Scope**: Per session, resettable
- **Tracks**: Conversation turns, follow-up context
- **Eviction**: Oldest turns dropped when `SESSION_MAX_TURNS` (default 20) is exceeded
- **Swap**: Implement `SessionStore` protocol with Redis for production clustering

### Long-Term User Memory (Persistent)

Two-layer storage:

| Layer | Storage | Data |
|-------|---------|------|
| Structured Profile | PostgreSQL `user_profiles` table (JSONB) | query_style, frequent_filters, output_preference, error_patterns, domain_focus |
| Behavioural Patterns | pgvector `vector_embeddings` (collection="memory") | Embedded summaries of past queries and results |

**Lifecycle**:
- Profile is loaded *before* SQL generation (for hint injection)
- Profile is updated *after* every successful query
- Behavioural embeddings are stored for similarity retrieval in future queries

---

## Schema Ingestion

### Why Not Pass Raw Schema to the LLM?

- Raw `CREATE TABLE` dumps waste tokens
- The LLM may hallucinate columns not in the schema
- Irrelevant tables add noise to the prompt

### Our Approach

1. **One-time ingestion** (`schema/schema_ingest.py`):
   - Each table is described semantically (name, description, columns, types, relationships)
   - Embedded via the configured embedding model
   - Stored in pgvector (`collection="schema"`)

2. **Runtime retrieval** (`schema/schema_retriever.py`):
   - User query is embedded
   - Cosine similarity search returns top-K relevant tables
   - Only retrieved snippets are injected into the LLM prompt

### Idempotency

- `ingest_schema()` checks if each table's vector already exists
- Skips if present; only processes new/missing tables
- Force re-ingestion via `POST /admin/reingest-schema`

### Trigger Rules

| Trigger | Allowed? |
|---------|----------|
| Initial deployment / startup | ✅ |
| Admin command | ✅ |
| CI/CD migration step | ✅ |
| User query | ❌ |
| Session start | ❌ |
| Memory update | ❌ |

---

## Directory Structure

```
backend/
├── app/
│   ├── main.py                  # FastAPI entry point, lifespan, CORS
│   │
│   ├── core/
│   │   ├── config.py            # Pydantic settings from .env
│   │   ├── longcat_client.py    # OpenAI-compatible LLM client
│   │   └── security.py          # JWT creation/verification
│   │
│   ├── agents/
│   │   ├── intent_guard.py      # Domain classification (keyword + LLM)
│   │   ├── sql_agent.py         # SQL generation via LLM
│   │   └── sql_validator.py     # Blocklist/allowlist SQL safety
│   │
│   ├── memory/
│   │   ├── session_memory.py    # Short-term conversation tracking
│   │   ├── user_profile.py      # JSONB user profiles (CRUD)
│   │   ├── vector_store.py      # pgvector abstraction (Qdrant-swappable)
│   │   └── memory_updater.py    # Post-query learning pipeline
│   │
│   ├── schema/
│   │   ├── schema_ingest.py     # One-time schema → vector ingestion
│   │   └── schema_retriever.py  # Runtime similarity search
│   │
│   ├── db/
│   │   ├── supabase.py          # Async SQLAlchemy engine
│   │   └── executor.py          # SQL execution + explanation
│   │
│   ├── api/
│   │   └── chat.py              # POST /api/query endpoint
│   │
│   └── utils/
│       ├── prompt_builder.py    # Assembles LLM prompts
│       └── sql_rules.py         # SQL rules block for prompts
│
├── requirements.txt
└── README.md
```

---

## Setup & Installation

### Prerequisites

- Python 3.11.2+
- A Supabase project with the [schema tables](#) created
- pgvector extension enabled on Supabase (`CREATE EXTENSION vector;`)
- A LongCat API key (or any OpenAI-compatible endpoint)

### Steps

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create a virtual environment
python -m venv venv

# 3. Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Create .env file (see Configuration below)
copy .env.example .env   # then edit with your credentials
```

---

## Configuration

Create a `.env` file in the `backend/` directory:

```env
# FastAPI
DEBUG=True
CORS_ORIGINS=http://localhost:3000

# Supabase
SUPABASE_DB_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# LongCat LLM
LONGCAT_API_BASE=https://api.longcat.ai/v1
LONGCAT_API_KEY=your-longcat-api-key
LONGCAT_MODEL=longcat-v1
LONGCAT_TEMPERATURE=0.0
LONGCAT_MAX_TOKENS=1024

# Embeddings
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536

# JWT
JWT_SECRET=your-super-secret-jwt-key
```

---

## Running the Server

```bash
# Development (with auto-reload)
uvicorn app.main:app --reload --port 8000

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at `http://localhost:8000`.
- Swagger docs: `http://localhost:8000/docs`
- Health check: `GET http://localhost:8000/health`

---

## API Reference

### `POST /api/query`

**Request:**
```json
{
  "user_id": "1",
  "session_id": "abc-123",
  "query": "Show me all employees in the Stitching department"
}
```

**Success Response:**
```json
{
  "id": "uuid",
  "sql": "SELECT e.emp_id, e.emp_name, e.designation, e.salary, e.status FROM employees e JOIN departments d ON e.dept_id = d.dept_id WHERE d.dept_name ILIKE '%Stitching%' LIMIT 500",
  "data": [
    {"emp_id": 3, "emp_name": "Muhammad Hassan", "designation": "Machine Operator", "salary": 35000, "status": "Active"}
  ],
  "columns": ["emp_id", "emp_name", "designation", "salary", "status"],
  "row_count": 1,
  "execution_time": 0.0312,
  "explanation": "Found 1 employee in the Stitching department.",
  "personalization_used": true,
  "status": "success"
}
```

**Error Response (out-of-domain):**
```json
{
  "id": "uuid",
  "error": "Please enter a query related to the system's database (employees, inventory, production, or sales).",
  "status": "error"
}
```

### `GET /health`

Returns `{"status": "ok", "version": "1.0.0"}`.

### `POST /admin/reingest-schema`

Force re-ingestion of all schema embeddings.

---

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| **pgvector over Qdrant** | Co-located with data in Supabase; no extra infrastructure. Abstracted via protocol for future swap. |
| **No ORM models** | SQLAlchemy Core + `text()` keeps control explicit; no magic queries. |
| **Two-layer intent guard** | Fast keyword scan saves LLM tokens for 90%+ of queries; LLM fallback catches edge cases. |
| **Schema as embeddings, not raw DDL** | Prevents token waste and hallucination of non-existent columns. |
| **JSONB + vector for user memory** | Structured data (filters, preferences) in JSONB for fast lookup; behavioural patterns as vectors for semantic matching. |
| **Session memory as in-memory dict** | Simple start; `SessionStore` protocol enables Redis swap with zero code changes. |
| **Strict SQL validator** | Defence-in-depth: even if the LLM generates something dangerous, it never reaches the database. |
| **Fire-and-forget memory updates** | Non-critical; wrapped in try/catch so a memory failure never blocks the user's response. |
