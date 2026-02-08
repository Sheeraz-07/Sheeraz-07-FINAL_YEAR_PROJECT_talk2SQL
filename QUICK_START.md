# Quick Start Scripts

## For Windows

### Start Backend
Double-click: `start-backend.bat`

Or in terminal:
```powershell
.\start-backend.bat
```

### Start Frontend  
Double-click: `start-frontend.bat`

Or in terminal:
```powershell
.\start-frontend.bat
```

## Manual Start

### Backend
```powershell
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

### Frontend
```powershell
npm run dev
```

---

**Note:** Run backend first, then frontend!
