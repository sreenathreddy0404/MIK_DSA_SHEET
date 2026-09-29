# DSA Sheet

A distraction-free DSA practice sheet with topics, problems, theory articles and per-account progress
tracking. Built as a clean **MERN stack** (MongoDB + Express + React + Node) — no external SaaS backend.

## Repo layout

```
.
├── frontend/   React SPA (Vite, JSX) — see frontend/README.md
│   ├── src/            components, pages, lib (API client, auth, queries)
│   ├── vite.config.js  dev server + /api proxy
│   └── .env.example    frontend environment variables
├── backend/    Express + MongoDB API (Node, ES modules) — see backend/README.md
│   ├── models/         Mongoose schemas
│   ├── routes/         REST routes
│   ├── controllers/    Request handlers
│   ├── middleware/     JWT auth + admin guards
│   ├── config/         DB connection + Passport (Google OAuth)
│   ├── seed/           Seeding script
│   └── .env.example    backend environment variables
├── eslint.config.js    shared ESLint flat config (frontend + backend)
└── package.json        root orchestration (npm workspaces)
```

The Vite dev server proxies `/api` requests to the Express API, so the frontend calls
`/api/...` relative paths in development.

## Requirements

- Node.js 18.11+ (tested with Node 24)
- A running MongoDB instance (local `mongod` or MongoDB Atlas / Docker `mongo`)

## Setup

```sh
npm install
```

### 1. Environment variables

**Backend** — copy `backend/.env.example` to `backend/.env`:

```sh
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dsa-sheet
JWT_SECRET=change-this-to-a-long-random-secret
CLIENT_URL=http://localhost:5173

# Optional Google OAuth (leave blank to disable)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

**Frontend** — optional, copy `frontend/.env.example` to `frontend/.env`:

```sh
VITE_API_URL=
VITE_GOOGLE_AUTH_ENABLED=false
```

### 2. Seed the database (first run)

```sh
npm run seed
```

Populates topics and sample problems. Skips if data already exists.

### 3. Run the app

```sh
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:5000 (`GET /api/health` to verify)

Each package can also be run on its own (`npm run dev` inside `frontend/` or `backend/`).

### Useful scripts

| Script           | Description                       |
| ---------------- | --------------------------------- |
| `npm run dev`    | Run API + web dev servers together |
| `npm run build`  | Production build of the frontend  |
| `npm run seed`   | Seed the database                 |
| `npm run lint`   | Lint frontend + backend           |
| `npm run format` | Format the codebase with Prettier |

## Authentication

- Email/password registration and login (bcrypt-hashed passwords, JWT stored in `localStorage` under `dsa-token`).
- The **first registered user is automatically made admin**; later signups get the `user` role.
- Optional Google OAuth via Passport once `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are set and
  `VITE_GOOGLE_AUTH_ENABLED=true` in the frontend env.
- Google auth does **not** require the user to set a password; progress is tied to the `User` document.

## API overview

| Method | Endpoint             | Access      | Description                          |
| ------ | -------------------- | ----------- | ------------------------------------ |
| POST   | `/api/auth/register` | public      | Create account                       |
| POST   | `/api/auth/login`    | public      | Sign in                              |
| GET    | `/api/auth/me`       | auth        | Current user                         |
| GET    | `/api/topics`        | public      | Active topics (ordered)              |
| POST/PATCH/DELETE | `/api/topics[/:id]`  | admin       | Manage topics                        |
| GET    | `/api/questions`     | public      | Active questions (ordered)           |
| GET    | `/api/questions/:id` | public      | Question detail incl. its topic      |
| POST/PATCH/DELETE | `/api/questions[/:id]` | admin    | Manage questions (content/links/video) |
| GET/PUT| `/api/progress`     | auth        | Read / update the current user's progress |
| GET    | `/api/admin/users`   | admin       | List all users                       |

## Security notes

- Passwords are hashed with bcrypt (cost factor 12).
- JWT secrets and DB credentials come from environment variables — never hardcoded.
- Admin routes are guarded by JWT auth + admin role checks on the server.
- `.env` files are gitignored (`*.env.example` are committed as templates).