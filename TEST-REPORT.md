# AgenticMyze Website — Test Report

Tested 2026-11-24 (PKT) on Node v24.22.1 / npm 10.9.4. Server started with `PORT=3000 node server.js`, tested live, then stopped. `node --check server.js` — no syntax errors.

## Route checks (curl, live server)

| Route | Expected | Got |
|---|---|---|
| `/` | 200 | 200 |
| `/courses` | 200 | 200 |
| `/course-roadmap` | 200 | 200 |
| `/pricing` | 200 | 200 |
| `/results` | 200 | 200 |
| `/ai-agents-course` | 200 | 200 |
| `/voice-agents` | 200 | 200 |
| `/whatsapp-automation` | 200 | 200 |
| `/get-first-client` | 200 | 200 |
| `/appoint-funnels` | 200 | 200 |
| `/contact` | 200 | 200 |
| `/privacy-policy` | 200 | 200 |
| `/landing` | 200 | 200 |
| `/payment` | 200 | 200 |
| `/payment?plan=starter` | 200 | 200 |
| `/payment?plan=professional` | 200 | 200 |
| `/payment?plan=elite` | 200 | 200 |
| `/payment?plan=enterprise` | 200 | 200 |
| `/admin` | 200 | 200 |
| `/api/health` | 200 | 200 (`{"ok":true}`) |
| `/api/plans` | 200 | 200 (4 plans) |
| `/styles.css`, `/app.js` | 200 | 200 |
| `/nonexistent-page` | 404 | 404 |

**23/23 routes passed** (22 × 200, 1 × 404 as expected).

## API POST tests

| Test | Expected | Got |
|---|---|---|
| POST `/api/leads` valid (Test Lead, 03078462895, professional) | 200 + id | 200, `lead-mwtn8kaf-nnv6q` |
| POST `/api/leads` missing name | 400 | 400 "Name is required" |
| POST `/api/leads` bad phone (`12345`, valid name) | 400 | 400 "valid Pakistani WhatsApp number" |
| POST `/api/contact` valid | 200 + id | 200, `contact-mwtn8kb8-y7boy` |
| POST `/api/contact` short message | 400 | 400 "Message is required" |
| POST `/api/enrollments` valid (elite, jazzcash, TID123456) | 200 + reference | 200, reference **`AMZ-U2WXOY`**, status `pending_verification` |
| POST `/api/enrollments` bad plan (`gold`) | 400 | 400 "valid plan is required" |
| POST `/api/enrollments` bad method (`cash`) | 400 | 400 "must be jazzcash, easypaisa, or bank" |
| POST `/api/contact` malformed JSON | 400, no crash | 400 "Invalid JSON body." — server stayed up |
| GET `/api/admin/leads` no token | 401 | 401 |
| GET `/api/admin/enrollments` wrong token | 401 | 401 |
| GET `/api/admin/leads|enrollments|contacts` with token `agenticmyze-admin` | 200 | 200, records returned |
| POST `/api/admin/status` enrollments → `verified` | 200 | 200, status updated and persisted |
| POST `/api/admin/status` invalid status | 400 | 400 "Invalid status." |
| GET `/api/admin/export.csv` no token | 401 | 401 |
| GET `/api/admin/export.csv` with token | 200 CSV | 200, CSV with header + the test enrollment row |

**16/16 API tests passed.**

## Persistence check

After the POSTs, `data/db.json` contained exactly 1 lead, 1 contact, and 1 enrollment (reference AMZ-U2WXOY), and `data/submissions.log` had 3 JSON lines — one per submission. **Test records were then removed**: `data/db.json` was reset to empty arrays and the test log deleted, so the site ships clean.

## Content checks (live HTML)

- Home: hero "Up to 2 Clients in 60 Days", 6 program cards, 4 pricing cards, 6 FAQ items, AI Automation / AI Agents / RAG sections — present.
- Roadmap page: **60 day cards**, **20 lectures**, all 6 phases (Days 1–5 … 31–60), Day 60 "Close or formally release open deals" — present.
- Results page: **6 testimonials** (Ahmed R., Sara K., Usman M., Fatima A., Ali H., Zara T.) — present.
- Pricing: Quick-Scale PKR 10,000 / Growth Catalyst PKR 30,000 / Scale PKR 60,000 / Enterprise PKR 200,000 — exact.
- No `href="#"` dead links anywhere in `public/` (0 found). No lorem ipsum (0 found).
- Logo `public/agenticmyze-logo.png` (452×240, user's own) and `public/favicon.png` copied from the live-site extraction.

## Not tested live

- Rate limit (30 POST /api/* per min per IP → 429): implemented in `server.js`, not triggered during testing to avoid polluting the test run.
- Full browser click-through of the payment wizard / admin UI: the wizard and admin flows call the same API endpoints that were tested directly above (enrollment 200 + reference, admin 200/401, CSV 200).

## Test server

Killed after testing. No test server left running.
