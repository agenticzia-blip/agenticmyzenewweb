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

## Dark redesign 2026-11-24
The user reported the rebuild was WHITE while the original site is BLACK. Visual design rebuilt only — no content, pricing, routes, or backend changes.
- Rewrote `public/styles.css` completely: near-black background #050505, off-white text #f5f5f5, muted grey #9a9a9a/#a1a1aa, dark cards #111/#161616/#181818 with 1px #222/#262626 borders, rounded 12–16px. No white cards anywhere; the only `background:#fff` left is for white pill buttons, badges, active tabs/steps and the toast.
- Buttons site-wide: primary = white pill, black text; secondary = transparent with #333 border, white text. Blue #2a82c4 kept only for tiny accents (active nav underline, focus outline).
- Added Playfair Display italic (Google Fonts, Georgia fallback) to all 17 pages; 50 `<em class="serif">` accents, e.g. hero "Automate Businesses.", "AI Automation?", "Pricing.", "Closing Clients", "Questions", "Start?" and equivalents on every other page.
- Hero centred on home + landing, with bordered pill badge "Up to 2 Clients in 60 Days ⚡", centred subtext, centred pill buttons, and the caps line "PACKAGE-SPECIFIC 60-DAY CLIENT OUTCOMES". Header black with white "Apply Now" pill. Featured Growth Catalyst card is #181818 with white "Choose Growth Catalyst" button; other price buttons are dark outline. Forms, payment boxes, success box, admin tables all dark.
- Re-test 2026-11-24 (PORT=3100, Node): routes 23/23 — 22×200 (all pages incl. all 4 payment variants, /admin, /api/health, /api/plans, /styles.css, /app.js) and 404 only on /nonexistent-page. POST /api/enrollments valid (elite/JazzCash) returned 200 with reference AMZ-PZ9LZJ. `node --check server.js` clean. Test server killed. Test record removed: data/db.json reset to empty arrays, data/submissions.log deleted.
