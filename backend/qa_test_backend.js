const http = require('http');
const mysql = require('mysql2/promise');
require('dotenv').config();

const BASE = 'http://localhost:5000/api';
let adminToken = '';
let customerToken = '';
let deliveryToken = '';

const results = [];
let pass = 0, fail = 0;

async function req(method, path, body, token, label) {
    return new Promise((resolve) => {
        const data = body ? JSON.stringify(body) : null;
        const url = new URL(BASE + path);
        const options = {
            hostname: url.hostname,
            port: url.port || 80,
            path: url.pathname + url.search,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
            },
        };
        const reqObj = http.request(options, (res) => {
            let raw = '';
            res.on('data', d => raw += d);
            res.on('end', () => {
                let parsed;
                try { parsed = JSON.parse(raw); } catch { parsed = raw; }
                const ok = res.statusCode < 400;
                const icon = ok ? '✅' : '❌';
                results.push({ label, status: res.statusCode, ok, body: typeof parsed === 'object' ? JSON.stringify(parsed).substring(0,100) : String(parsed).substring(0,100) });
                if (ok) pass++; else fail++;
                resolve({ status: res.statusCode, data: parsed });
            });
        });
        reqObj.on('error', (e) => {
            results.push({ label, status: 'ERR', ok: false, body: e.message });
            fail++;
            resolve({ status: 'ERR', data: null });
        });
        if (data) reqObj.write(data);
        reqObj.end();
    });
}

async function run() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('     QA AUTOMATED BACKEND TEST SUITE - Dairy Management    ');
    console.log('═══════════════════════════════════════════════════════════\n');

    // ── AUTH ───────────────────────────────────────────────────────────────────
    console.log('── [1] AUTH TESTS ──────────────────────────────────────────');

    // Get admin token from DB
    const pool = mysql.createPool({ host: process.env.DB_HOST || 'localhost', user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME || 'dairy_app' });
    const [admins] = await pool.query("SELECT u.*, users.email FROM users WHERE role = 'ADMIN' LIMIT 1").catch(() => [[],[]]);
    const [users] = await pool.query("SELECT * FROM users WHERE role = 'ADMIN' LIMIT 1");
    const [customers] = await pool.query("SELECT * FROM users WHERE role = 'CUSTOMER' LIMIT 1");
    const [deliveryBoys] = await pool.query("SELECT * FROM users WHERE role = 'DELIVERY_BOY' LIMIT 1");

    console.log('Users in DB - Admin:', users.length, '| Customer:', customers.length, '| DeliveryBoy:', deliveryBoys.length);

    // Login admin
    if (users.length > 0) {
        const loginRes = await req('POST', '/auth/login', { email: users[0].email, password: 'password123' }, null, 'Admin Login');
        if (loginRes.data && loginRes.data.token) {
            adminToken = loginRes.data.token;
            console.log('  Admin token acquired ✅');
        } else {
            console.log('  Admin login FAILED - trying common passwords...');
            for (const pwd of ['admin123', 'password', '123456', 'admin']) {
                const r2 = await req('POST', '/auth/login', { email: users[0].email, password: pwd }, null, `Admin Login attempt (${pwd})`);
                if (r2.data && r2.data.token) { adminToken = r2.data.token; console.log(`  Got token with pwd: ${pwd} ✅`); break; }
            }
        }
    }

    if (customers.length > 0) {
        const loginRes = await req('POST', '/auth/login', { email: customers[0].email, password: 'password123' }, null, 'Customer Login');
        if (loginRes.data && loginRes.data.token) { customerToken = loginRes.data.token; console.log('  Customer token acquired ✅'); }
    }

    if (deliveryBoys.length > 0) {
        const loginRes = await req('POST', '/auth/login', { email: deliveryBoys[0].email, password: 'password123' }, null, 'Delivery Login');
        if (loginRes.data && loginRes.data.token) { deliveryToken = loginRes.data.token; console.log('  Delivery token acquired ✅'); }
    }

    // ── ADMIN APIs ─────────────────────────────────────────────────────────────
    console.log('\n── [2] ADMIN API TESTS ─────────────────────────────────────');
    const adminTests = [
        ['GET', '/admin/dashboard', null, 'Admin Dashboard'],
        ['GET', '/admin/customers', null, 'Get Customers'],
        ['GET', '/admin/delivery-boys', null, 'Get Delivery Boys'],
        ['GET', '/admin/daily-logs', null, 'Daily Logs'],
        ['GET', '/admin/products', null, 'Products List'],
        ['GET', '/admin/inventory?date=2026-09-19', null, 'Inventory'],
        ['GET', '/admin/billing/overview', null, 'Billing Overview'],
        ['GET', '/admin/exceptions/upcoming', null, 'Upcoming Exceptions'],
        ['GET', '/admin/exceptions/tomorrow-routes', null, 'Tomorrow Routes'],
        ['GET', '/admin/performance', null, 'Performance Stats'],
        ['GET', '/admin/quantity-change-requests', null, 'Qty Change Requests'],
        ['GET', '/admin/audit-logs', null, 'Audit Logs'],
        ['GET', '/admin/billing/ledger/1', null, 'Customer Ledger'],
        ['GET', '/admin/wallet/1', null, 'Wallet History'],
    ];

    for (const [method, path, body, label] of adminTests) {
        const r = await req(method, path, body, adminToken, label);
        const icon = r.status < 400 ? '✅' : '❌';
        console.log(`  ${icon} [${r.status}] ${label}`);
    }

    // ── CUSTOMER APIs ──────────────────────────────────────────────────────────
    console.log('\n── [3] CUSTOMER API TESTS ──────────────────────────────────');
    const custTests = [
        ['GET', '/customer/dashboard', null, 'Customer Dashboard'],
        ['GET', '/customer/subscriptions', null, 'My Subscriptions'],
        ['GET', '/customer/bills', null, 'My Bills'],
        ['GET', '/customer/wallet', null, 'My Wallet'],
        ['GET', '/customer/skips', null, 'My Skips'],
        ['GET', '/customer/addons', null, 'My Addons'],
        ['GET', '/customer/account', null, 'My Account'],
        ['GET', '/customer/orders', null, 'My Orders'],
    ];

    for (const [method, path, body, label] of custTests) {
        const r = await req(method, path, body, customerToken, label);
        const icon = r.status < 400 ? '✅' : '❌';
        console.log(`  ${icon} [${r.status}] ${label}`);
    }

    // ── DELIVERY APIs ──────────────────────────────────────────────────────────
    console.log('\n── [4] DELIVERY BOY API TESTS ──────────────────────────────');
    const delTests = [
        ['GET', '/delivery/today-route', null, 'Today Route'],
        ['GET', '/delivery/summary', null, 'Delivery Summary'],
        ['GET', '/delivery/my-performance', null, 'My Performance'],
    ];

    for (const [method, path, body, label] of delTests) {
        const r = await req(method, path, body, deliveryToken, label);
        const icon = r.status < 400 ? '✅' : '❌';
        console.log(`  ${icon} [${r.status}] ${label}`);
    }

    // ── NOTIFICATIONS ──────────────────────────────────────────────────────────
    console.log('\n── [5] NOTIFICATION API TESTS ──────────────────────────────');
    const notifRes = await req('GET', '/notifications', null, adminToken, 'Notifications');
    console.log(`  ${notifRes.status < 400 ? '✅' : '❌'} [${notifRes.status}] Get Notifications`);

    // ── DB SCHEMA CHECKS ────────────────────────────────────────────────────────
    console.log('\n── [6] DATABASE SCHEMA CHECKS ──────────────────────────────');
    const tables = ['users', 'customers', 'delivery_boys', 'products', 'subscriptions', 
                    'deliveries', 'delivery_skip_requests', 'delivery_addons', 'bills', 
                    'inventory', 'audit_log', 'notifications', 'wallet_transactions',
                    'quantity_change_requests', 'delivery_routes'];
    for (const table of tables) {
        const [rows] = await pool.query(`SELECT COUNT(*) as c FROM ${table}`).catch(e => [[{c: 'ERR: '+e.code}]]);
        const count = rows[0].c;
        const icon = typeof count === 'number' ? '✅' : '❌';
        console.log(`  ${icon} Table: ${table} | Rows: ${count}`);
    }

    await pool.end();

    // ── SUMMARY ─────────────────────────────────────────────────────────────────
    console.log('\n══════════════════════════════════════════════════════════');
    console.log(`  RESULTS: ${pass} PASSED | ${fail} FAILED`);
    console.log('══════════════════════════════════════════════════════════');
    
    const failures = results.filter(r => !r.ok);
    if (failures.length > 0) {
        console.log('\n❌ FAILURES TO FIX:');
        failures.forEach(f => console.log(`  - [${f.status}] ${f.label}: ${f.body}`));
    }
}

run().catch(console.error);
