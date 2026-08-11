# ResumeIQ / CV Analyzer Monorepo

Separated Frontend & Backend Architecture.

## Directory Structure

```
cv_analyzer/
├── frontend/             # Next.js Application (UI)
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── next.config.ts
│   └── .env.local
├── backend/              # Node.js + Express + TypeScript Application
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
└── README.md
```

## Running the Project

### 1. Backend Server
```bash
cd backend
npm install
npm run dev
# Starts on http://localhost:5000
```

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
# Starts on http://localhost:3000
```
