# 🚀 Talk2SQL Setup Guide — Step by Step

## What We're Going to Do

We're going to connect your **Next.js frontend** (the website) to your **Python backend** (the brain) so that when you type a question like "Show me all employees", the backend will:

1. Check if your question is about the database
2. Generate SQL code
3. Run it on your Supabase database
4. Send the results back to show on your website

---

## 📋 What You Need Before Starting

- [ ] Python 3.11 or newer installed
- [ ] Node.js installed (for the Next.js frontend)
- [ ] A Supabase account with a database
- [ ] A LongCat API key (or OpenAI API key)
- [ ] Your database schema already created in Supabase

---

## Step 1: Set Up Supabase Database

### 1.1 Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and log in
2. Open your project
3. Click on **"Settings"** (gear icon on the left sidebar)
4. Click on **"Database"**
5. Scroll down and copy these values:
   - **Connection string** (the one that starts with `postgresql://`)
   - **Host** (looks like `db.xxxxx.supabase.co`)

### 1.2 Enable pgvector Extension

This lets us store and search schema embeddings.

1. In your Supabase dashboard, click on **"SQL Editor"** (left sidebar)
2. Click **"+ New query"**
3. Paste this code:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

4. Click **"Run"** (or press Ctrl+Enter)
5. You should see: "Success. No rows returned"

✅ **Done! Your database is ready.**

---

## Step 2: Set Up Python Backend

### 2.1 Open Terminal in Backend Folder

1. Open Visual Studio Code
2. Click **Terminal** → **New Terminal** (at the top)
3. Type this command to go to the backend folder:

```powershell
cd backend
```

Press Enter.

### 2.2 Create a Virtual Environment

This keeps Python packages separate from your system.

```powershell
python -m venv venv
```

Press Enter. Wait for it to finish (might take 30 seconds).

### 2.3 Activate the Virtual Environment

```powershell
.\venv\Scripts\activate
```

Press Enter. You should see `(venv)` appear before your command prompt.

### 2.4 Install Required Packages

```powershell
pip install -r requirements.txt
```

Press Enter. This will download and install all the Python packages. **Wait for it to finish** (might take 2-3 minutes).

✅ **Done! Python packages installed.**

---

## Step 3: Configure Backend Environment Variables

### 3.1 Copy the Example File

```powershell
copy .env.example .env
```

Press Enter. This creates a new file called `.env`.

### 3.2 Open and Edit the .env File

1. In VS Code file explorer, find `backend/.env`
2. Double-click to open it
3. Now we need to fill in the values:

#### A. Supabase Database URL

Find this line:
```env
SUPABASE_DB_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
```

Replace it with your actual Supabase connection string. **Important:**
- Keep `postgresql+asyncpg://` at the start
- Replace everything else with your Supabase connection string

**Example:**
```env
SUPABASE_DB_URL=postgresql+asyncpg://postgres.abc123xyz:mysecretpass@db.abc123xyz.supabase.co:5432/postgres
```

#### B. LongCat API Key

Find this line:
```env
LONGCAT_API_KEY=your-longcat-api-key
```

Replace `your-longcat-api-key` with your actual LongCat API key.

**If you don't have LongCat, you can use OpenAI instead:**
- Change `LONGCAT_API_BASE` to: `https://api.openai.com/v1`
- Change `LONGCAT_API_KEY` to your OpenAI API key
- Change `LONGCAT_MODEL` to: `gpt-4o-mini` or `gpt-3.5-turbo`

#### C. Embedding Model

If using OpenAI, keep this:
```env
EMBEDDING_MODEL=text-embedding-3-small
```

#### D. Save the File

Press **Ctrl+S** to save.

✅ **Done! Backend configuration complete.**

---

## Step 4: Start the Backend Server

### 4.1 Make Sure You're in the Backend Folder

In your terminal, you should see:
```
(venv) ...\backend>
```

If not, type:
```powershell
cd backend
.\venv\Scripts\activate
```

### 4.2 Start the Server

```powershell
uvicorn app.main:app --reload --port 8000
```

Press Enter.

**What you should see:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**If you see an error:**
- Check your `.env` file values are correct
- Make sure Supabase connection string is right
- Make sure virtual environment is activated

✅ **Done! Backend is running on http://localhost:8000**

#### Test It

Open your web browser and go to:
```
http://localhost:8000/docs
```

You should see a fancy interactive API documentation page. Try clicking on **"GET /health"** and then **"Try it out"** → **"Execute"**. You should see:
```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

---

## Step 5: Set Up Frontend

### 5.1 Open a NEW Terminal

**Don't close the backend terminal!** Keep it running.

1. In VS Code, click **Terminal** → **New Terminal**
2. You should now have 2 terminals open

### 5.2 Install Frontend Dependencies

In the new terminal:

```powershell
npm install
```

Press Enter. Wait for it to finish (might take 1-2 minutes).

### 5.3 Check Frontend Environment Variable

Open the file `.env.local` in the root folder. It should have:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

If this file doesn't exist or is empty, create it and add the line above.

✅ **Done! Frontend ready.**

---

## Step 6: Start the Frontend

In your **second terminal** (not the one running the backend):

```powershell
npm run dev
```

Press Enter.

**What you should see:**
```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
- Ready in 2.5s
```

✅ **Done! Frontend is running on http://localhost:3000**

---

## Step 7: Test the Full System

### 7.1 Open the Website

Open your browser and go to:
```
http://localhost:3000
```

### 7.2 Login

The frontend has a demo login. Just click **"Login"** and use any credentials (it's mocked for now).

### 7.3 Go to Query Page

Click on **"Query"** in the sidebar.

### 7.4 Type a Question

Type something like:
```
Show me all employees
```

Click **"Ask"** or press Enter.

### 7.5 What Should Happen

You should see:
1. **Loading animation** (4 steps)
2. **Generated SQL** appears in a box
3. **Results table** appears below with data from your database

---

## 🎯 What Each Part Does

### Frontend (Next.js)
- **Location:** The main folder (has `src/`, `public/`, etc.)
- **What it does:** Shows the website, takes your questions, sends them to the backend
- **Runs on:** http://localhost:3000

### Backend (Python/FastAPI)
- **Location:** `backend/` folder
- **What it does:** Receives questions, generates SQL, runs it on database, sends back results
- **Runs on:** http://localhost:8000

### Database (Supabase)
- **Location:** In the cloud at supabase.com
- **What it does:** Stores all your employee, product, sales data

---

## 🔍 How the Query Flow Works

```
You type: "Show me all employees"
    ↓
Frontend sends to: http://localhost:8000/api/query
    ↓
Backend receives and checks: "Is this about the database?"
    ↓
Backend generates SQL: "SELECT * FROM employees LIMIT 500"
    ↓
Backend validates SQL: "Is this safe?"
    ↓
Backend runs SQL on Supabase
    ↓
Backend sends back: { sql: "...", data: [...], columns: [...] }
    ↓
Frontend displays in table
```

---

## 🐛 Common Problems and Solutions

### Problem 1: "Module not found" Error in Backend

**Solution:**
```powershell
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Problem 2: Backend Won't Start — "Connection Error"

**Solution:** Check your `.env` file:
- Is `SUPABASE_DB_URL` correct?
- Did you enable the pgvector extension?
- Is your Supabase project running?

### Problem 3: Frontend Shows Mock Data Instead of Real Data

**Solution:** 
- Make sure backend is running (check http://localhost:8000/docs)
- Check `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:8000`
- Restart the frontend:
  - Press `Ctrl+C` in the frontend terminal
  - Run `npm run dev` again

### Problem 4: "Out of domain" Error

**Solution:** Your question isn't recognized as database-related. Try asking about:
- Employees: "Show me all active employees"
- Inventory: "What items are low in stock?"
- Production: "Show production orders"
- Sales: "Show recent sales"

### Problem 5: SQL Generation Fails

**Solution:**
- Check your LongCat/OpenAI API key is correct in `.env`
- Make sure you have credits/quota remaining on your API account
- Check backend terminal for error messages

---

## 📝 Files You Modified/Created

You might notice these files are new or changed:

✅ **Backend files** (the brain):
- `backend/.env` — Your secret configuration (never share this!)
- `backend/app/api/chat.py` — Simplified to remove memory features
- `backend/app/main.py` — Simplified startup

✅ **Frontend files** (the website):
- `src/stores/queryStore.ts` — Updated to call real backend
- `.env.local` — Points to backend URL

✅ **Other files**:
- `.gitignore` — Tells Git to ignore junk files

---

## 🎉 Success Checklist

- [ ] Backend starts without errors
- [ ] Can visit http://localhost:8000/docs
- [ ] Frontend starts without errors
- [ ] Can visit http://localhost:3000
- [ ] Can type a query and see SQL generated
- [ ] Can see real data from Supabase in the results table

---

## 🔮 What's NOT Active Yet (For Future)

The following features are built but **turned off** for now:

- ❌ Session memory (conversation context)
- ❌ User profiles (personalization)
- ❌ Memory embeddings (learning from past queries)
- ❌ JWT authentication

These will be activated when you're ready!

---

## 🆘 Need Help?

If something doesn't work:

1. **Check both terminals** — look for red error messages
2. **Check the browser console** — Press F12, click "Console" tab
3. **Check backend logs** — The terminal running the backend shows detailed logs
4. **Restart everything:**
   ```powershell
   # Stop both terminals (Ctrl+C)
   # Then start backend:
   cd backend
   .\venv\Scripts\activate
   uvicorn app.main:app --reload --port 8000
   
   # In another terminal, start frontend:
   npm run dev
   ```

---

## 🎓 Understanding the Code

If you want to understand what each file does:

### Backend
- `app/main.py` — The starting point, sets everything up
- `app/api/chat.py` — Handles the `/api/query` endpoint
- `app/agents/intent_guard.py` — Checks if query is database-related
- `app/agents/sql_agent.py` — Generates SQL using LLM
- `app/agents/sql_validator.py` — Makes sure SQL is safe
- `app/db/executor.py` — Runs SQL on Supabase

### Frontend
- `src/stores/queryStore.ts` — Manages query state, calls backend
- `src/components/query/QueryInterface.tsx` — The query input box
- `src/components/query/DataTable.tsx` — Shows results in a table

---

**You're all set! 🎊 Type your first query and watch the magic happen!**
