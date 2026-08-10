# BG / LC / FD Tracker — Frontend

React + Vite + Tailwind frontend for the BG/LC/FD Tracker system, built against the
Spring Boot backend in `bglctracker/`.

## Setup

```bash
npm install
cp .env.example .env   # adjust VITE_API_BASE_URL if backend isn't on localhost:8080
npm run dev
```

The dev server runs on http://localhost:5173 and proxies `/api/*` calls to
`http://localhost:8080` (your Spring Boot backend) — see `vite.config.js`.

## Build

```bash
npm run build
npm run preview
```

## First-time login

The backend blocks self-registration unless the exact `app.registration.key`
(`bglctrackers` by default, see backend `application.properties`) is supplied.
Use the **Create an account** screen once with that key, then log in normally.

## Structure

```
src/
  api/          axios client + one file per backend resource
  context/      AuthContext (JWT session)
  routes/       ProtectedRoute guard
  components/   layout shell + reusable UI primitives
  pages/        one folder per module (master data, fd, lc, bg, fdlink, reports, dashboard)
  utils/        formatters & shared constants
```

## Modules

- **Dashboard** — active BG/LC totals, Open/Lien FD totals, and 7/30/60-day expiry reminders.
- **Master Data** — Group Companies, Banks, Clients, Vendors, Guarantee Types.
- **FD Tracker** — Fixed Deposits with Open / Lien-Marked / Closed status.
- **Letters of Credit** — full LC lifecycle with linked-FD summary.
- **Bank Guarantees** — full BG lifecycle with linked-FD summary.
- **FD Linking** — pledge/unpledge FDs as margin against a BG or LC (many-to-many).
- **Reports** — LC Active, BG Active, Open FD, Lien FD, Closed FD.
