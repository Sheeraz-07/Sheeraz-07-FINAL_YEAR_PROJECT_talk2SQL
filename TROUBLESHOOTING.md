# 🔧 Troubleshooting Guide

## Backend Won't Start

### Error: "No module named 'fastapi'"

**What it means:** Python packages not installed

**Solution:**
```powershell
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
```

---

### Error: "Could not connect to database"

**What it means:** Supabase connection failed

**Check these:**

1. **Is your `.env` file correct?**
   ```powershell
   notepad backend\.env
   ```
   
2. **Is the database URL properly formatted?**
   - Must start with `postgresql+asyncpg://`
   - Must have your actual password (no spaces)
   - Example: `postgresql+asyncpg://postgres.abc:pass123@db.abc.supabase.co:5432/postgres`

3. **Is your Supabase project running?**
   - Go to supabase.com
   - Check if project is active (not paused)

**Test connection:**
```python
# Run in Python:
python
>>> from app.core.config import get_settings
>>> settings = get_settings()
>>> print(settings.SUPABASE_DB_URL)
# Should show your connection string (with real values)
```

---

### Error: "pgvector extension not found"

**What it means:** pgvector not enabled in Supabase

**Solution:**
1. Go to Supabase dashboard
2. Click **SQL Editor**
3. Run: `CREATE EXTENSION IF NOT EXISTS vector;`

---

### Error: "LongCat API key invalid"

**What it means:** Your LLM API key is wrong or expired

**Solution:**

**For LongCat:**
1. Check your API key at longcat.ai
2. Update `LONGCAT_API_KEY` in `backend/.env`

**For OpenAI (alternative):**
1. Get API key from platform.openai.com
2. In `backend/.env`, change:
   ```env
   LONGCAT_API_BASE=https://api.openai.com/v1
   LONGCAT_API_KEY=sk-your-openai-key
   LONGCAT_MODEL=gpt-4o-mini
   ```

**Test API key:**
```powershell
cd backend
.\venv\Scripts\activate
python -c "from app.core.longcat_client import _get_client; print(_get_client())"
```

---

## Frontend Won't Start

### Error: "Cannot find module 'next'"

**What it means:** Node modules not installed

**Solution:**
```powershell
npm install
```

---

### Error: "Port 3000 already in use"

**What it means:** Another app is using port 3000

**Solution 1:** Stop the other app using the port

**Solution 2:** Use a different port
```powershell
npm run dev -- -p 3001
```
Then visit http://localhost:3001

---

## Frontend Shows Mock Data

### Problem: Results are fake, not from database

**What it means:** Frontend can't reach backend

**Check:**

1. **Is backend running?**
   - Open: http://localhost:8000/docs
   - Should show API documentation
   - If not loading → backend is not running

2. **Is `.env.local` correct?**
   ```powershell
   notepad .env.local
   ```
   Should have:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Restart frontend:**
   ```powershell
   # Press Ctrl+C to stop
   npm run dev
   ```

**Test backend connection:**
Open browser console (F12) and run:
```javascript
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(console.log)
// Should show: { status: "ok", version: "1.0.0" }
```

---

## Query Errors

### Error: "Out of domain query rejected"

**What it means:** Your question isn't recognized as database-related

**Common causes:**
- ❌ "What's the weather?"
- ❌ "Tell me a joke"
- ❌ "How are you?"

**What works:**
- ✅ "Show me all employees"
- ✅ "What products do we have?"
- ✅ "Show recent sales"
- ✅ "Which items are low in stock?"

**Keywords that work:**
- employee, staff, worker, salary
- department, attendance, leave
- inventory, stock, material, supplier
- product, production, manufacturing
- sale, revenue, customer, order

---

### Error: "Could not find relevant database tables"

**What it means:** Schema not ingested or query too vague

**Solution 1:** Force re-ingest schema
```powershell
# In backend terminal (while server is running):
curl -X POST http://localhost:8000/admin/reingest-schema
```

**Solution 2:** Be more specific
- ❌ Vague: "show me stuff"
- ✅ Specific: "show me all employees in the Stitching department"

---

### Error: "SQL generation failed"

**What it means:** LLM couldn't generate SQL

**Check:**

1. **API quota:** Do you have credits/quota left?
2. **API key:** Is it still valid?
3. **Query clarity:** Is your question clear?

**Test LLM directly:**
```powershell
cd backend
.\venv\Scripts\activate
python
>>> from app.core.longcat_client import chat_completion
>>> import asyncio
>>> result = asyncio.run(chat_completion([{"role":"user","content":"Say hello"}]))
>>> print(result)
# Should print "Hello!" or similar
```

---

### Error: "Query execution failed"

**What it means:** SQL ran but Supabase rejected it

**Common causes:**

1. **Table doesn't exist**
   - Check your schema is created in Supabase
   - Run the schema creation SQL from your requirements

2. **Permission denied**
   - Your Supabase user needs read permissions
   - Check RLS (Row Level Security) policies

3. **Syntax error in SQL**
   - Check the generated SQL in the error message
   - Usually means LLM hallucinated a column name

**Test database directly:**
```sql
-- In Supabase SQL Editor:
SELECT * FROM employees LIMIT 5;
```

---

## Schema Not Found

### Problem: Backend says "No tables found"

**Diagnosis:**
```powershell
# Check if schema ingested:
curl http://localhost:8000/admin/reingest-schema
```

**Solution 1:** Manual re-ingestion
1. Stop backend (Ctrl+C)
2. In `backend/app/main.py`, find:
   ```python
   result = await ingest_schema(force=False)
   ```
   Change to:
   ```python
   result = await ingest_schema(force=True)
   ```
3. Restart backend
4. Check logs for "Schema ingestion result"

**Solution 2:** Check vector table exists
In Supabase SQL Editor:
```sql
SELECT COUNT(*) FROM vector_embeddings WHERE collection = 'schema';
-- Should return a number > 0
```

---

## CORS Errors

### Error in browser console: "CORS policy blocked"

**What it means:** Backend not allowing frontend requests

**Solution:**

In `backend/.env`, check:
```env
CORS_ORIGINS=http://localhost:3000
```

If using a different frontend port, update it:
```env
CORS_ORIGINS=http://localhost:3001
```

**Restart backend** after changing.

---

## Performance Issues

### Problem: Queries are very slow

**Check:**

1. **LLM response time:** Usually 2-10 seconds first time
2. **Database location:** Supabase might be in different region
3. **Schema embeddings:** First query after restart is slower

**Normal timings:**
- Intent check: < 1 second
- Schema retrieval: < 1 second  
- SQL generation: 2-5 seconds
- Execution: < 1 second

---

## Logging & Debugging

### See detailed backend logs

**Backend already logs to terminal. To see more:**

In `backend/app/main.py`, find:
```python
logging.basicConfig(
    level=logging.DEBUG,  # Already set to DEBUG
```

**Log file locations:**
- Backend: Terminal output only (no file yet)
- Frontend: Browser console (F12)

### Enable verbose SQL logging

In `backend/.env`:
```env
DEBUG=True
```

This will show every SQL query executed.

---

## Database Issues

### Problem: No data returned

**Check if tables have data:**

In Supabase SQL Editor:
```sql
-- Check each table:
SELECT COUNT(*) FROM employees;
SELECT COUNT(*) FROM departments;
SELECT COUNT(*) FROM products;
-- etc.
```

**If counts are 0:** Add test data

**Sample insert:**
```sql
INSERT INTO departments (dept_name, location) 
VALUES ('Production', 'Building A');

INSERT INTO employees (emp_name, email, salary, status, dept_id, designation)
VALUES ('Test Employee', 'test@example.com', 50000, 'Active', 1, 'Developer');
```

---

## Restart Everything (Nuclear Option)

When nothing else works:

### Step 1: Stop everything
```powershell
# In both terminals: Press Ctrl+C
```

### Step 2: Clear caches
```powershell
# Frontend:
rm -r .next
rm -r node_modules\.cache

# Backend:
cd backend
rm -r app\__pycache__
cd ..
```

### Step 3: Restart backend
```powershell
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

### Step 4: Restart frontend (in new terminal)
```powershell
npm run dev
```

---

## Still Not Working?

### Collect debug info:

1. **Backend version:**
   ```powershell
   python --version
   pip list | findstr fastapi
   ```

2. **Frontend version:**
   ```powershell
   node --version
   npm --version
   ```

3. **Environment files exist:**
   ```powershell
   dir backend\.env
   dir .env.local
   ```

4. **Backend health check:**
   ```powershell
   curl http://localhost:8000/health
   ```

5. **Backend startup logs:**
   Copy the first 20 lines from backend terminal

6. **Browser console errors:**
   F12 → Console tab → copy any red errors

---

## Getting Help

If you're stuck:

1. Check the **Setup Guide** (SETUP_GUIDE.md)
2. Check the **Architecture** (ARCHITECTURE.md)
3. Look at backend logs (where it's running)
4. Check browser console (F12)
5. Try the restart steps above

**Error message templates:**

When asking for help, include:
- What you were trying to do
- The exact error message (copy-paste)
- Backend logs (last 10 lines)
- Browser console errors (if any)
- Your OS (Windows version)
- Python version (`python --version`)
