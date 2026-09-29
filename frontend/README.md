# DSA Sheet — Frontend

React (Vite) single-page application for the DSA Sheet. JavaScript/JSX only.

## Scripts

```sh
npm run dev      # Vite dev server on http://localhost:5173
npm run build    # Production build -> dist/
npm run preview  # Preview the production build
npm run lint     # ESLint (React/JS)
```

## Environment

Copy `.env.example` to `.env`:

| Variable                 | Purpose                                                        |
| ------------------------ | -------------------------------------------------------------- |
| `VITE_API_URL`           | API base URL (leave empty to use the Vite `/api` dev proxy)    |
| `VITE_GOOGLE_AUTH_ENABLED` | `"true"` shows the "Continue with Google" button             |

## API proxy

The dev server proxies `/api/*` to the Express backend
(`http://localhost:5000` by default, overridable with `VITE_API_URL`). See
`vite.config.js`.

Routing uses React Router. Auth tokens are stored in `localStorage` under
`dsa-token` and attached to API calls by `src/lib/api.js`.