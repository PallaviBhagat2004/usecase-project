# Full-Stack App — AKS CI/CD Demo

Production-ready full-stack task manager deployed to Azure Kubernetes Service via Azure DevOps pipelines.

## Stack

- **Frontend** — React 18, served by nginx (with `/api` reverse-proxy to backend)
- **Backend** — Node.js 20, Express 4, in-memory data store
- **Tests** — Jest + Supertest (backend), React Testing Library (frontend)
- **Containers** — Docker multi-stage builds, non-root user, health checks
- **Orchestration** — docker-compose locally, Kubernetes on AKS in production
- **CI/CD** — Azure DevOps Pipelines

## Project structure

```
fullstack-app/
├── backend/              Express API
│   ├── src/
│   │   ├── app.js        Express app factory (testable)
│   │   └── server.js     Entry point with graceful shutdown
│   ├── tests/
│   │   └── app.test.js   Supertest API tests
│   ├── Dockerfile
│   └── package.json
├── frontend/             React SPA
│   ├── src/
│   │   ├── components/   Reusable components
│   │   ├── __tests__/    Component + integration tests
│   │   ├── App.js
│   │   ├── api.js        Axios client (mockable)
│   │   └── index.js
│   ├── nginx.conf        Reverse proxy config
│   ├── Dockerfile
│   └── package.json
├── k8s/                  Kubernetes manifests
│   ├── backend-deployment.yaml
│   └── frontend-deployment.yaml
├── docker-compose.yml         Production-mode local stack
├── docker-compose.dev.yml     Dev-mode with hot reload
└── azure-pipelines.yml        CI/CD definition
```

## Local development

### Option 1: Run frontend and backend separately

```bash
# Terminal 1 — backend
cd backend
npm install
npm run dev          # runs on http://localhost:5000

# Terminal 2 — frontend
cd frontend
npm install
npm start            # runs on http://localhost:3000
```

### Option 2: Run everything via docker-compose

```bash
# Production-style build (slower start, faster runtime)
docker compose up --build

# Or dev-mode with hot reload
docker compose -f docker-compose.dev.yml up
```

Then open `http://localhost:8080` (production mode) or `http://localhost:3000` (dev mode).

## Running tests

```bash
# Backend tests with coverage
cd backend && npm test

# Frontend tests with coverage
cd frontend && npm test
```

Coverage reports are written to `backend/coverage/` and `frontend/coverage/`.

## Building images

```bash
# Backend
docker build -t backend:local ./backend

# Frontend
docker build -t frontend:local ./frontend
```

## Deploying to AKS

After CI pushes images to ACR, the CD pipeline applies the K8s manifests:

```bash
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
```

Get the public IP:

```bash
kubectl get svc frontend
```

## Architecture

```
Browser
   │
   ▼
[Frontend Pod (nginx)]  ───── /api/* ─────►  [Backend Pod (Express)]
   │   (LoadBalancer)                            (ClusterIP, internal only)
   ▼
Public IP
```

The nginx proxy means the browser only ever talks to one origin — no CORS issues, no exposed backend.
