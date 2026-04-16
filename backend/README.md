# Backend API

Node.js + Express backend for AI-Driven Batch Counselling System.

## Setup

1. Copy `.env.example` to `.env`.
2. Install dependencies:

```bash
npm install
```

3. Start development server:

```bash
npm run dev
```

Server runs at `http://localhost:5000`.

## Core APIs

- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- Students: `/api/students`
- Batches: `/api/batches`, `/api/batches/auto-assign`
- Counsellors: `/api/counsellors/assigned-students`, `/api/counsellors/feedback`
- AI Predictions: `/api/predictions/student/:studentId`, `/api/predictions/bulk`
- Dashboard: `/api/dashboard/admin`
- Reports: `/api/reports/student/:studentId/pdf`, `/api/reports/students/excel`
- Notifications: `/api/notifications`
