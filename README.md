# AgenticMyze Website — with Real Backend

A complete rebuild of https://agenticmyze.consultfunnels.com/ — every page working, with a real Node.js + Express backend (no build step, no framework).

## Run locally

```bash
npm install
npm start
# open http://localhost:3000
```

Set a port: `PORT=3000 node server.js`. Set the admin token: `ADMIN_TOKEN=your-secret npm start` (default `agenticmyze-admin` — change it before going live).

## Deploy on Vercel

1. Push this folder to a GitHub repo.
2. In Vercel: **Add New → Project → Import** the repo. Framework preset: **Other**. No build command.
3. Add environment variable `ADMIN_TOKEN` (your secret) in Vercel → Settings → Environment Variables.
4. Deploy. `vercel.json` routes all requests through the Express server (`server.js`).

> Note: on Vercel's serverless runtime the filesystem is ephemeral, so `data/db.json` does not persist between invocations. For production, point the store at a hosted database later; locally it persists in `data/db.json` and every submission is also appended to `data/submissions.log` as a backup.

## Pages (all clean URLs, no .html in the address bar)

| Route | Page |
|---|---|
| `/` | Home — hero, 6 program cards, pricing, 60-day journey, AI Automation / AI Agents / RAG, FAQ, CTA |
| `/courses` | Courses + full pricing |
| `/course-roadmap` | Full 60-day day-by-day plan (Days 1–60) + 20 lectures, Schedule/Lectures tabs, pricing |
| `/pricing` | Pricing — Quick-Scale PKR 10,000 / Growth Catalyst PKR 30,000 / Scale PKR 60,000 / Enterprise PKR 200,000 |
| `/results` | 6 student testimonials |
| `/ai-agents-course` | 8 modules |
| `/voice-agents` | 8 modules, 4 program cards |
| `/whatsapp-automation` | 8 modules, 4 cards |
| `/get-first-client` | Client acquisition playbook |
| `/appoint-funnels` | Funnel system — what's included |
| `/contact` | Working contact form (POSTs to `/api/contact`) + email/WhatsApp/phone cards |
| `/privacy-policy` | Privacy + refund policy, last updated Oct 2026 |
| `/landing` | Short landing page — Call Now / Chat on WhatsApp |
| `/payment?plan=starter\|professional\|elite\|enterprise` | Real 3-step enrollment flow (details → payment method → transaction reference), returns reference `AMZ-XXXXXX` |
| `/admin` | Admin dashboard — token login, leads/enrollments/contacts tables, status updates, CSV export |
| unknown route | 404 page |

## API

- `GET /api/health` → `{ok:true}`
- `GET /api/plans` → the 4 plans
- `POST /api/leads` `{name, whatsapp, plan?, interest?, source?}`
- `POST /api/contact` `{name, whatsapp, email?, message, plan?}`
- `POST /api/enrollments` `{name, whatsapp, plan, paymentMethod, transactionRef}` → returns `reference` like `AMZ-XXXXXX`, status `pending_verification`
- `GET /api/admin/leads`, `/api/admin/enrollments`, `/api/admin/contacts` — header `x-admin-token`
- `POST /api/admin/status` `{type, id, status}` — header `x-admin-token`
- `GET /api/admin/export.csv` — header `x-admin-token`, downloads enrollments CSV

Validation: Pakistani mobile (`03xx` / `+92`), plan and payment method checked server-side; bad input returns `400` with a clear error; bad JSON never crashes the server. POST `/api/*` is rate-limited to 30 requests/min per IP (429 after that).

## ⚠️ Before going live — replace these

1. **Real payment account details** — JazzCash, Easypaisa, and bank account details are placeholders in `public/app.js` (`accounts` object) and `config.js`. The payment page labels them clearly until you replace them.
2. **ADMIN_TOKEN** — change from the default `agenticmyze-admin` via `.env` / Vercel env vars.

## Brand

Black, white, brand blue `#2a82c4` only. Logo: `public/agenticmyze-logo.png` (user's own logo), favicon `public/favicon.png`. Contact: agenticmyze@gmail.com · 03078462895 · https://wa.me/923078462895
