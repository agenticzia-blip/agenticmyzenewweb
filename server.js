// AgenticMyze — Node.js + Express backend (no build step)
// Run: npm install && npm start   (PORT env, default 3000)
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'agenticmyze-admin';
const DB_PATH = path.join(__dirname, 'data', 'db.json');
const LOG_PATH = path.join(__dirname, 'data', 'submissions.log');

const PLANS = {
  starter: { id: 'starter', name: 'Quick-Scale', price: 10000, priceLabel: 'PKR 10,000', clients: 0, guarantee: 'No client guarantee' },
  professional: { id: 'professional', name: 'Growth Catalyst', price: 30000, priceLabel: 'PKR 30,000', clients: 1, guarantee: '1 client guaranteed in 60 days' },
  elite: { id: 'elite', name: 'Scale', price: 60000, priceLabel: 'PKR 60,000', clients: 2, guarantee: '2 clients guaranteed in 60 days' },
  enterprise: { id: 'enterprise', name: 'Enterprise', price: 200000, priceLabel: 'PKR 200,000', clients: 5, guarantee: '5 clients guaranteed; no delivery timeframe specified' },
};
const PAYMENT_METHODS = ['jazzcash', 'easypaisa', 'bank'];
const STATUSES = ['new', 'contacted', 'enrolled', 'paid', 'verified', 'pending_verification'];

// ---- JSON store ----
function loadDb() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    const d = JSON.parse(raw);
    return { leads: d.leads || [], enrollments: d.enrollments || [], contacts: d.contacts || [] };
  } catch (e) { return { leads: [], enrollments: [], contacts: [] }; }
}
let db = loadDb();
function saveDb() {
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (e) { console.error('DB save failed:', e.message); }
}
function logSubmission(rec) {
  try { fs.appendFileSync(LOG_PATH, JSON.stringify(rec) + '\n'); } catch (e) { /* log is a backup only */ }
}
function newId(prefix) {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}
function makeRef() { return 'AMZ-' + Math.random().toString(36).slice(2, 8).toUpperCase(); }

// ---- security headers (helmet-style, no extra dep) ----
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});
app.use(express.json({ limit: '100kb' }));
// Bad JSON must never crash the server
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') return res.status(400).json({ ok: false, error: 'Invalid JSON body.' });
  next(err);
});

// ---- rate limit: max 30 POST /api/* per IP per minute ----
const hits = new Map();
function rateLimit(req, res, next) {
  if (req.method !== 'POST' || !req.path.startsWith('/api/')) return next();
  const now = Date.now(), key = req.ip || 'unknown';
  const arr = (hits.get(key) || []).filter(t => now - t < 60000);
  arr.push(now); hits.set(key, arr);
  if (arr.length > 30) return res.status(429).json({ ok: false, error: 'Too many requests. Please wait a minute and try again.' });
  next();
}
app.use(rateLimit);

// ---- validation ----
function validWhatsapp(v) {
  if (typeof v !== 'string') return false;
  const d = v.replace(/[\s\-()]/g, '');
  return /^(?:\+92|92|0)?3\d{9}$/.test(d);
}
function validEmail(v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function requireAdmin(req, res, next) {
  if (req.headers['x-admin-token'] !== ADMIN_TOKEN) return res.status(401).json({ ok: false, error: 'Unauthorized: valid admin token required.' });
  next();
}

// ---- public API ----
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.get('/api/plans', (req, res) => res.json({ ok: true, plans: Object.values(PLANS) }));

app.post('/api/leads', (req, res) => {
  const b = req.body || {};
  if (!b.name || String(b.name).trim().length < 2) return res.status(400).json({ ok: false, error: 'Name is required (at least 2 characters).' });
  if (!validWhatsapp(b.whatsapp)) return res.status(400).json({ ok: false, error: 'A valid Pakistani WhatsApp number is required (03xx-xxxxxxx or +92...).' });
  if (b.plan && !PLANS[b.plan]) return res.status(400).json({ ok: false, error: 'Unknown plan.' });
  const lead = { id: newId('lead'), name: String(b.name).trim(), whatsapp: String(b.whatsapp).trim(), plan: b.plan || null, interest: b.interest || null, source: b.source || 'website', status: 'new', createdAt: new Date().toISOString() };
  db.leads.push(lead); saveDb(); logSubmission({ type: 'lead', ...lead });
  res.json({ ok: true, id: lead.id, lead });
});

app.post('/api/contact', (req, res) => {
  const b = req.body || {};
  if (!b.name || String(b.name).trim().length < 2) return res.status(400).json({ ok: false, error: 'Name is required (at least 2 characters).' });
  if (!validWhatsapp(b.whatsapp)) return res.status(400).json({ ok: false, error: 'A valid Pakistani WhatsApp number is required (03xx-xxxxxxx or +92...).' });
  if (!validEmail(b.email)) return res.status(400).json({ ok: false, error: 'Email address is not valid.' });
  if (!b.message || String(b.message).trim().length < 5) return res.status(400).json({ ok: false, error: 'Message is required (at least 5 characters).' });
  if (b.plan && !PLANS[b.plan]) return res.status(400).json({ ok: false, error: 'Unknown plan.' });
  const c = { id: newId('contact'), name: String(b.name).trim(), whatsapp: String(b.whatsapp).trim(), email: (b.email || '').trim(), message: String(b.message).trim(), plan: b.plan || null, status: 'new', createdAt: new Date().toISOString() };
  db.contacts.push(c); saveDb(); logSubmission({ type: 'contact', ...c });
  res.json({ ok: true, id: c.id, contact: c });
});

app.post('/api/enrollments', (req, res) => {
  const b = req.body || {};
  if (!b.name || String(b.name).trim().length < 2) return res.status(400).json({ ok: false, error: 'Name is required (at least 2 characters).' });
  if (!validWhatsapp(b.whatsapp)) return res.status(400).json({ ok: false, error: 'A valid Pakistani WhatsApp number is required (03xx-xxxxxxx or +92...).' });
  if (!b.plan || !PLANS[b.plan]) return res.status(400).json({ ok: false, error: 'A valid plan is required: starter, professional, elite, or enterprise.' });
  if (!PAYMENT_METHODS.includes(b.paymentMethod)) return res.status(400).json({ ok: false, error: 'Payment method must be jazzcash, easypaisa, or bank.' });
  if (!b.transactionRef || String(b.transactionRef).trim().length < 4) return res.status(400).json({ ok: false, error: 'Transaction reference is required (at least 4 characters).' });
  const e = { id: newId('enroll'), reference: makeRef(), name: String(b.name).trim(), whatsapp: String(b.whatsapp).trim(), plan: b.plan, planName: PLANS[b.plan].name, amount: PLANS[b.plan].price, paymentMethod: b.paymentMethod, transactionRef: String(b.transactionRef).trim(), status: 'pending_verification', createdAt: new Date().toISOString() };
  db.enrollments.push(e); saveDb(); logSubmission({ type: 'enrollment', ...e });
  res.json({ ok: true, id: e.id, reference: e.reference, enrollment: e });
});

// ---- admin API ----
app.get('/api/admin/leads', requireAdmin, (req, res) => res.json({ ok: true, leads: db.leads }));
app.get('/api/admin/enrollments', requireAdmin, (req, res) => res.json({ ok: true, enrollments: db.enrollments }));
app.get('/api/admin/contacts', requireAdmin, (req, res) => res.json({ ok: true, contacts: db.contacts }));
app.post('/api/admin/status', requireAdmin, (req, res) => {
  const b = req.body || {};
  const coll = { leads: db.leads, enrollments: db.enrollments, contacts: db.contacts }[b.type];
  if (!coll) return res.status(400).json({ ok: false, error: 'type must be leads, enrollments, or contacts.' });
  if (!STATUSES.includes(b.status)) return res.status(400).json({ ok: false, error: 'Invalid status.' });
  const rec = coll.find(r => r.id === b.id);
  if (!rec) return res.status(404).json({ ok: false, error: 'Record not found.' });
  rec.status = b.status; saveDb();
  res.json({ ok: true, record: rec });
});
app.get('/api/admin/export.csv', requireAdmin, (req, res) => {
  const esc = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  const rows = [['reference', 'name', 'whatsapp', 'plan', 'planName', 'amount', 'paymentMethod', 'transactionRef', 'status', 'createdAt']];
  db.enrollments.forEach(e => rows.push([e.reference, e.name, e.whatsapp, e.plan, e.planName, e.amount, e.paymentMethod, e.transactionRef, e.status, e.createdAt]));
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="enrollments.csv"');
  res.send(rows.map(r => r.map(esc).join(',')).join('\n'));
});

// ---- clean-URL page routes ----
const PAGES = {
  '/': 'index.html', '/courses': 'courses.html', '/course-roadmap': 'course-roadmap.html',
  '/pricing': 'pricing.html', '/results': 'results.html', '/ai-agents-course': 'ai-agents-course.html',
  '/voice-agents': 'voice-agents.html', '/whatsapp-automation': 'whatsapp-automation.html',
  '/get-first-client': 'get-first-client.html', '/appoint-funnels': 'appoint-funnels.html',
  '/contact': 'contact.html', '/privacy-policy': 'privacy-policy.html', '/landing': 'landing.html',
  '/payment': 'payment.html', '/admin': 'admin.html',
};
Object.entries(PAGES).forEach(([route, file]) => {
  app.get(route, (req, res) => res.sendFile(path.join(__dirname, 'public', file)));
});
app.use(express.static(path.join(__dirname, 'public')));
// 404 for everything else (API 404s stay JSON)
app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ ok: false, error: 'API route not found.' });
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(PORT, () => console.log('AgenticMyze running on http://localhost:' + PORT));
