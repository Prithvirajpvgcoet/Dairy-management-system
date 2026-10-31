const http = require('http');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
} else {
    require('dotenv').config();
}

const BASE = 'http://localhost:5000/api';
const CREDS = {
    admin: { email: 'admin@dairy.com', password: 'Test@1234' },
    customer: { email: 'amit@gmail.com', password: 'Test@1234' },
    delivery: { email: 'rahul@dairy.com', password: 'Test@1234' },
};

let tokens = { admin: '', customer: '', delivery: '' };
const results = [];

async function req(method, pathUrl, body, token, label, expectedStatus = null) {
    return new Promise((resolve) => {
        const data = body ? JSON.stringify(body) : null;
        const opts = {
            hostname: 'localhost', port: 5000,
            path: '/api' + pathUrl, method,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
            },
        };
        const r = http.request(opts, (res) => {
            let raw = '';
            res.on('data', d => raw += d);
            res.on('end', () => {
                let parsed;
                try { parsed = JSON.parse(raw); } catch { parsed = raw; }
                const ok = expectedStatus !== null ? res.statusCode === expectedStatus : res.statusCode < 400;
                results.push({ label, status: res.statusCode, ok, body: typeof parsed === 'object' ? JSON.stringify(parsed).substring(0, 120) : String(parsed).substring(0, 120) });
                resolve({ status: res.statusCode, data: parsed, ok });
            });
        });
        r.on('error', (e) => {
            results.push({ label, status: 'ERR', ok: false, body: e.message });
            resolve({ status: 'ERR', data: null, ok: false });
        });
        if (data) r.write(data);
        r.end();
    });
}

function log(label, r) {
    const icon = r.ok ? '✅' : '❌';
    const body = results.find(x => x.label === label);
    const snippet = body ? body.body.substring(0,80) : '';
    console.log(`  ${icon} [${r.status}] ${label}${!r.ok ? '  →  ' + snippet : ''}`);
}

async function login(role) {
    const r = await req('POST', '/auth/login', CREDS[role], null, `Login ${role}`);
    if (r.data && r.data.token) { tokens[role] = r.data.token; return true; }
    console.log(`  ❌ LOGIN FAILED for ${role}:`, JSON.stringify(r.data));
    return false;
}

async function run() {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║    QA BACKEND TEST SUITE — Dairy Management System          ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    // ─── [1] AUTH ──────────────────────────────────────────────────────────────
    console.log('━━━ [1] AUTH TESTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    await login('admin');
    await login('customer');
    await login('delivery');
    console.log('  Admin token:', tokens.admin ? '✅ acquired' : '❌ missing');
    console.log('  Customer token:', tokens.customer ? '✅ acquired' : '❌ missing');
    console.log('  Delivery token:', tokens.delivery ? '✅ acquired' : '❌ missing');

    // Test invalid login
    const badLogin = await req('POST', '/auth/login', { email: 'admin@dairy.com', password: 'wrongpass' }, null, 'Bad Login', 401);
    console.log(`  ${badLogin.ok ? '✅' : '❌'} [${badLogin.status}] Bad credentials rejected (expected 401)`);

    // Test no token
    const noToken = await req('GET', '/admin/dashboard', null, null, 'No Token', 401);
    console.log(`  ${noToken.ok ? '✅' : '❌'} [${noToken.status}] Unauthenticated request rejected (expected 401)`);

    // ─── [2] ADMIN APIs ────────────────────────────────────────────────────────
    console.log('\n━━━ [2] ADMIN API TESTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const adminTests = [
        ['GET',  '/admin/dashboard',                null,                          'GET /admin/dashboard'],
        ['GET',  '/admin/customers',                null,                          'GET /admin/customers'],
        ['GET',  '/admin/delivery-boys',            null,                          'GET /admin/delivery-boys'],
        ['GET',  '/admin/daily-logs',               null,                          'GET /admin/daily-logs'],
        ['GET',  '/admin/products',                 null,                          'GET /admin/products'],
        ['GET',  '/admin/inventory?date=2026-10-31',null,                          'GET /admin/inventory'],
        ['GET',  '/admin/billing/overview?month=10&year=2026', null,               'GET /admin/billing/overview'],
        ['GET',  '/admin/billing/daily-report',     null,                          'GET /admin/billing/daily-report'],
        ['GET',  '/admin/billing/ledger/1',         null,                          'GET /admin/billing/ledger/:id'],
        ['GET',  '/admin/exceptions/upcoming',      null,                          'GET /admin/exceptions/upcoming'],
        ['GET',  '/admin/exceptions/tomorrow-routes',null,                         'GET /admin/exceptions/tomorrow-routes'],
        ['GET',  '/admin/performance',              null,                          'GET /admin/performance'],
        ['GET',  '/admin/quantity-change-requests', null,                          'GET /admin/quantity-change-requests'],
        ['GET',  '/admin/audit-logs',               null,                          'GET /admin/audit-logs'],
        ['GET',  '/admin/wallet/1',                 null,                          'GET /admin/wallet/:id'],
        ['POST', '/admin/billing/generate',         { month: 10, year: 2026 },     'POST /admin/billing/generate'],
    ];
    for (const [m, p, b, l] of adminTests) {
        const r = await req(m, p, b, tokens.admin, l);
        log(l, r);
    }

    // RBAC test: customer token should NOT access admin routes
    console.log('\n  ── RBAC Tests (customer token on admin routes) ──');
    const rbacTest = await req('GET', '/admin/dashboard', null, tokens.customer, 'RBAC: Customer→Admin', 403);
    console.log(`  ${rbacTest.ok ? '✅' : '❌'} [${rbacTest.status}] Customer denied admin access (expected 403)`);

    // ─── [3] CUSTOMER APIs ─────────────────────────────────────────────────────
    console.log('\n━━━ [3] CUSTOMER API TESTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const dayAfter = new Date(Date.now() + 172800000).toISOString().split('T')[0];

    const customerTests = [
        ['GET',  '/customer/dashboard',     null,                                                        'GET /customer/dashboard'],
        ['GET',  '/customer/subscriptions', null,                                                        'GET /customer/subscriptions'],
        ['GET',  '/customer/bills',         null,                                                        'GET /customer/bills'],
        ['GET',  '/customer/wallet',        null,                                                        'GET /customer/wallet'],
        ['GET',  '/customer/skips',         null,                                                        'GET /customer/skips'],
        ['GET',  '/customer/addons',        null,                                                        'GET /customer/addons'],
        ['GET',  '/customer/account',       null,                                                        'GET /customer/account'],
        ['GET',  '/customer/orders',        null,                                                        'GET /customer/orders'],
        ['POST', '/customer/skip',          { skip_date: tomorrow, skip_end_date: dayAfter, reason: 'Testing' }, 'POST /customer/skip (multi-day)'],
        ['POST', '/customer/change-quantity', { requests: [{ product_id: 1, requested_quantity: 2, effective_date: tomorrow, reason: 'QA test' }] }, 'POST /customer/change-quantity'],
    ];
    for (const [m, p, b, l] of customerTests) {
        const r = await req(m, p, b, tokens.customer, l);
        log(l, r);
    }

    // ─── [4] DELIVERY PARTNER APIs ─────────────────────────────────────────────
    console.log('\n━━━ [4] DELIVERY PARTNER API TESTS ━━━━━━━━━━━━━━━━━━━━━━━━');
    const deliveryTests = [
        ['GET', '/delivery/today-route',   null,  'GET /delivery/today-route'],
        ['GET', '/delivery/summary',       null,  'GET /delivery/summary'],
        ['GET', '/delivery/my-performance',null,  'GET /delivery/my-performance'],
    ];
    for (const [m, p, b, l] of deliveryTests) {
        const r = await req(m, p, b, tokens.delivery, l);
        log(l, r);
    }

    // ─── [5] NOTIFICATIONS ─────────────────────────────────────────────────────
    console.log('\n━━━ [5] NOTIFICATION API TESTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const notifR = await req('GET', '/notifications', null, tokens.admin, 'GET /notifications (admin)');
    log('GET /notifications (admin)', notifR);
    const notifCustR = await req('GET', '/notifications', null, tokens.customer, 'GET /notifications (customer)');
    log('GET /notifications (customer)', notifCustR);

    // ─── [6] DATABASE SCHEMA ───────────────────────────────────────────────────
    console.log('\n━━━ [6] DATABASE SCHEMA & DATA CHECKS ━━━━━━━━━━━━━━━━━━━━');
    const pool = mysql.createPool({ 
        host: process.env.DB_HOST || 'localhost', 
        user: process.env.DB_USER || 'root', 
        password: process.env.DB_PASSWORD || '', 
        database: process.env.DB_NAME || 'dairy_db' 
    });

    const tables = [
        ['users', 'Roles exist'],
        ['customers', 'GPS lat/lng columns'],
        ['delivery_skip_requests', 'Skip tracking'],
        ['delivery_addons', 'Addon tracking'],
        ['wallet_transactions', 'Wallet transactions'],
        ['quantity_change_requests', 'Qty change requests'],
        ['notifications', 'Notifications'],
        ['audit_log', 'Audit logs'],
        ['bills', 'Bills'],
        ['inventory', 'Inventory'],
    ];
    for (const [table, desc] of tables) {
        try {
            const [rows] = await pool.query(`SELECT COUNT(*) as c FROM \`${table}\``);
            console.log(`  ✅ Table: ${table.padEnd(28)} Rows: ${rows[0].c} — ${desc}`);
        } catch(e) {
            console.log(`  ❌ Table: ${table.padEnd(28)} ERROR: ${e.message.substring(0,60)}`);
        }
    }
    // Check wallet_balance column on customers
    try {
        const [r] = await pool.query('SELECT wallet_balance, gps_lat, gps_lng FROM customers LIMIT 1');
        console.log(`  ✅ customers.wallet_balance + gps columns: OK (val: ${r[0].wallet_balance}, lat: ${r[0].gps_lat})`);
    } catch(e) {
        console.log(`  ❌ customers wallet/gps columns: ${e.message}`);
    }
    await pool.end();

    // ─── SUMMARY ───────────────────────────────────────────────────────────────
    const pass = results.filter(r => r.ok).length;
    const fail = results.filter(r => !r.ok).length;
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log(`║  FINAL RESULTS: ${String(pass).padStart(2)} PASSED  |  ${String(fail).padStart(2)} FAILED                         ║`);
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    if (fail > 0) {
        console.log('❌ FAILED ENDPOINTS:');
        results.filter(r => !r.ok).forEach(r => {
            console.log(`  [${r.status}] ${r.label}`);
            console.log(`        → ${r.body}`);
        });
    }
}

run().catch(console.error);
