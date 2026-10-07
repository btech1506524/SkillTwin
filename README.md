# SkillTwin AI — Career Intelligence Platform

SkillTwin AI is a personalized career intelligence and placement-readiness platform designed for engineering students (Sem 5 CSE curriculum benchmarks). It compares student competencies against tech industry roles, visualizes skill gaps, simulates growth trajectories, and generates tailored preparation roadmaps.

---

## 🏗️ Architecture Overview

The codebase consists of:
1. **Frontend (`/src`)**: Single Page Application built with React 18, Vite, React Router v7, and CSS glassmorphism styling.
2. **Primary Application Server (`/server`)**: Node.js Express REST API (ES Modules) running on port `5000`. Handles student profile state, authentication, AI career simulations, and resume competency scanning.
3. **Relational MySQL Server (`/backend`)**: Optional persistence backend running on port `5001`. Provides MySQL connection pooling, user registration, authentication, and schema queries.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Frontend
npm install

# Primary API Server
cd server
npm install
cd ..

# (Optional) MySQL Backend
cd backend
npm install
cd ..
```

### 2. Configure Environment Variables
Copy or adjust `.env` files in `server/` and `backend/`:
- `server/.env`:
  ```env
  PORT=5000
  JWT_SECRET=<your-secure-random-jwt-secret>
  CLIENT_ORIGIN=http://localhost:5173
  ```
- `backend/.env` (if using MySQL):
  ```env
  PORT=5001
  JWT_SECRET=<your-backend-jwt-secret>
  CLIENT_ORIGIN=http://localhost:5173
  DB_HOST=localhost
  DB_USER=root
  DB_PASS=<your-mysql-password>
  DB_NAME=skilltwin
  DB_PORT=3306
  ```

### 3. Run the Application
In separate terminal windows:
```bash
# Terminal 1: Primary API Server (port 5000)
npm run server

# Terminal 2: Vite Frontend Client (port 5173)
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Quick Evaluation (Evaluator / Demo Mode)
You can launch instant demo mode with 1-click on the Login/Signup pages or Home page. This preloads complete Sem 5 CSE profile benchmarks for **Sanjay Kumar (NIT, 8.6 CGPA)** with interactive skill sliders and AI simulator scenarios.