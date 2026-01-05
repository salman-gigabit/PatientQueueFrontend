# Clinic Patient Queue

## Tech Stack

### Frontend

- **React**
- **JavaScript**
- **CSS**

### Backend

- **FastAPI** – Python web framework for APIs
- **Uvicorn** – ASGI server to run FastAPI
- **Pydantic** – Data validation
- **JSON** – Storage

---

## Quick Start

### 1. Start Backend

**macOS/Linux:**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate

pip install fastapi uvicorn
uvicorn app.main:app --reload --port 8000
```

**Windows:**
```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate

pip install fastapi uvicorn
uvicorn app.main:app --reload --port 8000
```

### 2. Start Frontend

```bash
cd frontend
npm install
npm run dev
``` 