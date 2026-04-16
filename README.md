# AI-Driven Batch Counselling System

Production-oriented full-stack college counselling platform.

## Tech Stack

- Frontend: React.js (CRA), Recharts, Framer Motion
- Backend: Node.js, Express, JWT, MySQL
- AI Module: Python Flask (rule-based + weighted scoring)
- Reports: PDF (PDFKit) and Excel (ExcelJS)

## Project Structure

- `frontend/` React dashboard app
- `backend/` Express API with RBAC and JWT
- `ai-module/` AI prediction microservice
- `database/` MySQL schema and seed scripts

## Setup Order

1. Database

```bash
# In MySQL shell
SOURCE database/schema.sql;
SOURCE database/seed.sql;
```

2. AI service

```bash
cd ai-module
pip install -r requirements.txt
python app.py
```

3. Backend

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

4. Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm start
```

Frontend runs on `http://localhost:3000`.
Backend runs on `http://localhost:5000`.
AI service runs on `http://localhost:5001`.

## Demo Credentials

- Admin: `admin@college.edu` / `Password@123`
- Counsellor: `counsellor1@college.edu` / `Password@123`
- Counsellor: `counsellor2@college.edu` / `Password@123`
