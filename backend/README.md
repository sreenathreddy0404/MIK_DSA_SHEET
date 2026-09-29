# DSA Sheet — Backend

Express + MongoDB REST API for the DSA Sheet (Node.js, ES modules).

## Scripts

```sh
npm run dev     # Run with auto-restart on file changes
npm start       # Run in production
npm run seed    # Seed topics/questions (skips if data exists)
npm run lint    # ESLint (Node/JS)
```

## Environment

Copy `.env.example` to `.env`:

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | no | API port (default `5000`) |
| `MONGODB_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | Secret used to sign auth tokens |
| `CLIENT_URL` | no | Frontend origin for CORS / OAuth redirects (default `http://localhost:5173`) |
| `GOOGLE_CLIENT_ID` | no | Google OAuth client id (disables Google auth if empty) |
| `GOOGLE_CLIENT_SECRET` | no | Google OAuth client secret |

The server requires `JWT_SECRET` and `MONGODB_URI` and exits if they are missing.

## Layout

```
config/       MongoDB connection + Passport (Google OAuth)
models/       Mongoose schemas (User, Topic, Question, UserProgress)
routes/       REST route definitions
controllers/  Request handlers
middleware/   JWT auth + admin guards
utils/        Response formatters
seed/         Database seeding script
```

The first registered user is automatically assigned the `admin` role; later
signups get `user`. Deleting a topic removes its questions; deleting a question
removes matching progress rows.