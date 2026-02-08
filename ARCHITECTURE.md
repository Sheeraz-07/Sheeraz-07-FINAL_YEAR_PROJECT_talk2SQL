# 🎯 Simplified System Architecture

## Current Implementation (Query Generation Only)

```
┌─────────────────────────────────────────────────────────────┐
│                     YOUR WEB BROWSER                        │
│                   http://localhost:3000                     │
│                                                             │
│   [Type Query: "Show me all employees"]                     │
│                         ↓                                   │
│   [Click "Ask" Button]                                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ POST /api/query
                          │ { query: "Show me all employees" }
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                 PYTHON BACKEND (FastAPI)                    │
│                  http://localhost:8000                      │
│                                                             │
│  ┌───────────────────────────────────────────────────┐     │
│  │ STEP 1: Intent Guard                              │     │
│  │ Question: "Is this about the database?"           │     │
│  │ ✅ Yes → Continue                                 │     │
│  │ ❌ No → Return: "Please ask about database"      │     │
│  └───────────────────────────────────────────────────┘     │
│                          ↓                                  │
│  ┌───────────────────────────────────────────────────┐     │
│  │ STEP 2: Schema Retrieval                          │     │
│  │ • Embed the query into a vector                   │     │
│  │ • Search for similar tables in vector DB          │     │
│  │ • Find: "employees" table is relevant             │     │
│  └───────────────────────────────────────────────────┘     │
│                          ↓                                  │
│  ┌───────────────────────────────────────────────────┐     │
│  │ STEP 3: SQL Generation (LLM)                      │     │
│  │ Send to LongCat/OpenAI:                          │     │
│  │ "Generate SQL for: Show me all employees"         │     │
│  │                                                   │     │
│  │ LLM Returns:                                      │     │
│  │ SELECT * FROM employees LIMIT 500                 │     │
│  └───────────────────────────────────────────────────┘     │
│                          ↓                                  │
│  ┌───────────────────────────────────────────────────┐     │
│  │ STEP 4: SQL Validation                            │     │
│  │ Check for dangerous keywords:                     │     │
│  │ ❌ DROP, DELETE, ALTER → REJECT                   │     │
│  │ ✅ SELECT only → PASS                             │     │
│  └───────────────────────────────────────────────────┘     │
│                          ↓                                  │
│  ┌───────────────────────────────────────────────────┐     │
│  │ STEP 5: Execute on Supabase                       │     │
│  │ Run: SELECT * FROM employees LIMIT 500            │     │
│  │ Get: [                                            │     │
│  │   {emp_id: 1, name: "Ahmed", dept: "Prod"},      │     │
│  │   {emp_id: 2, name: "Fatima", dept: "QC"},       │     │
│  │   ...                                             │     │
│  │ ]                                                 │     │
│  └───────────────────────────────────────────────────┘     │
│                          ↓                                  │
│  ┌───────────────────────────────────────────────────┐     │
│  │ STEP 6: Return Response                           │     │
│  │ {                                                 │     │
│  │   sql: "SELECT * FROM employees...",              │     │
│  │   data: [...rows...],                             │     │
│  │   columns: ["emp_id", "name", "dept"],            │     │
│  │   row_count: 156                                  │     │
│  │ }                                                 │     │
│  └───────────────────────────────────────────────────┘     │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ JSON Response
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND DISPLAYS                       │
│                                                             │
│   ┌───────────────────────────────────────────────┐        │
│   │ Generated SQL:                                │        │
│   │ SELECT * FROM employees LIMIT 500             │        │
│   └───────────────────────────────────────────────┘        │
│                                                             │
│   ┌─────┬──────────┬────────────┬────────────┐            │
│   │ ID  │ Name     │ Department │ Salary     │            │
│   ├─────┼──────────┼────────────┼────────────┤            │
│   │ 1   │ Ahmed    │ Production │ 85,000     │            │
│   │ 2   │ Fatima   │ Quality    │ 55,000     │            │
│   │ ... │ ...      │ ...        │ ...        │            │
│   └─────┴──────────┴────────────┴────────────┘            │
│                                                             │
│   Found 156 matching results.                              │
└─────────────────────────────────────────────────────────────┘
```

## What's NOT Active Yet

```
❌ Session Memory    → Will track conversation history
❌ User Profiles     → Will learn your preferences
❌ Memory Embeddings → Will remember past queries
❌ Personalization   → Will customize SQL based on habits
```

These features are **built** but **turned off** to keep things simple for now!

## File Locations for Each Step

| Step | File | What It Does |
|------|------|--------------|
| **Entry** | `backend/app/api/chat.py` | Receives query, orchestrates all steps |
| **Step 1** | `backend/app/agents/intent_guard.py` | Two-layer check (keywords + LLM) |
| **Step 2** | `backend/app/schema/schema_retriever.py` | Vector search for relevant tables |
| **Step 3** | `backend/app/agents/sql_agent.py` | Calls LLM to generate SQL |
| **Step 4** | `backend/app/agents/sql_validator.py` | Safety checks (no DROP/DELETE/etc) |
| **Step 5** | `backend/app/db/executor.py` | Runs SQL on Supabase |
| **Step 6** | `backend/app/api/chat.py` | Formats and returns response |
| **Display** | `src/stores/queryStore.ts` | Calls backend API |
| | `src/components/query/QueryInterface.tsx` | Input box |
| | `src/components/query/DataTable.tsx` | Results table |

## Database Tables Used

### Required Tables (Your Schema)
- `departments`
- `employees`
- `attendance`
- `leaves`
- `suppliers`
- `raw_materials`
- `inventory`
- `products`
- `production_orders`
- `production_details`
- `sales_orders`

### System Tables (Auto-Created by Backend)
- `vector_embeddings` — Stores schema embeddings for similarity search

## Environment Variables Needed

### Backend (`backend/.env`)
```env
SUPABASE_DB_URL=postgresql+asyncpg://postgres:pass@db.xxx.supabase.co:5432/postgres
LONGCAT_API_KEY=your-api-key
LONGCAT_MODEL=longcat-v1  # or gpt-4o-mini for OpenAI
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## How to Test Each Step

### Test 1: Intent Guard
**Query:** "What's the weather today?"
**Expected:** Error message saying "Please ask about database"

### Test 2: Schema Retrieval
**Query:** "Show employees"
**Expected:** Finds the `employees` table

### Test 3: SQL Generation
**Query:** "Show all employees"
**Expected:** Generates `SELECT * FROM employees LIMIT 500`

### Test 4: SQL Validation
**Query:** (manually try) "DROP TABLE employees"
**Expected:** Rejected with safety error

### Test 5: Execution
**Query:** "Show all employees"
**Expected:** Returns actual data from your Supabase database

### Test 6: Display
**Result:** See data in a nice table on the frontend

## Quick Debug Checklist

| Issue | Check | Fix |
|-------|-------|-----|
| Backend won't start | `.env` file values | Copy from Supabase dashboard |
| No tables found | Schema ingestion | Check backend logs for errors |
| SQL generation fails | API key | Check LongCat/OpenAI key is valid |
| No data returned | Database empty | Add some test data to Supabase |
| Frontend shows mock data | Backend not running | Start backend first |
