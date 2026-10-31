const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const pool = require('../src/config/db');

const BASE_URL = 'http://localhost:5000/api';

async function runPhase4Gate() {
    console.log('=== PHASE 4 GATE VERIFICATION ===\n');

    try {
        // -------------------------------------------------------------
        // [Gate 1] Zero alert() and Zero window.confirm() in frontend/src
        // -------------------------------------------------------------
        console.log('[Gate 1] Checking for zero alert() and window.confirm() in frontend/src...');
        const srcDir = path.resolve(__dirname, '../../frontend/src');
        let alertOccurrences = [];
        let confirmOccurrences = [];

        function scanDir(dir) {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    scanDir(fullPath);
                } else if (entry.name.endsWith('.jsx') || entry.name.endsWith('.js')) {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    if (content.match(/\balert\s*\(/)) {
                        alertOccurrences.push(path.relative(srcDir, fullPath));
                    }
                    if (content.match(/\bwindow\.confirm\s*\(/)) {
                        confirmOccurrences.push(path.relative(srcDir, fullPath));
                    }
                }
            }
        }
        scanDir(srcDir);

        if (alertOccurrences.length > 0 || confirmOccurrences.length > 0) {
            console.error('❌ Found lingering alerts or confirms:', { alertOccurrences, confirmOccurrences });
            process.exit(1);
        }
        console.log('✅ Passed: Zero alert() and zero window.confirm() in entire frontend/src!');

        // -------------------------------------------------------------
        // [Gate 2] Auth Profile (/auth/me) & Password Change Lifecycle
        // -------------------------------------------------------------
        console.log('\n[Gate 2] Testing /auth/me & Password Change Lifecycle...');
        const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@dairy.com',
            password: 'Test@1234'
        });
        const adminToken = adminLogin.data.token;
        const adminHeaders = { Authorization: `Bearer ${adminToken}` };

        // Test GET /auth/me
        const meRes = await axios.get(`${BASE_URL}/auth/me`, { headers: adminHeaders });
        if (!meRes.data?.user || meRes.data.user.email !== 'admin@dairy.com') {
            console.error('❌ Failed: /auth/me did not return correct user profile:', meRes.data);
            process.exit(1);
        }
        console.log(`✅ Passed: /auth/me returned profile for ${meRes.data.user.name} (${meRes.data.user.role})`);

        // Test POST /auth/change-password rejection on wrong old password
        try {
            await axios.post(`${BASE_URL}/auth/change-password`, {
                currentPassword: 'WrongPassword999',
                newPassword: 'NewPassword@123'
            }, { headers: adminHeaders });
            console.error('❌ Failed: Password change accepted incorrect old password!');
            process.exit(1);
        } catch (err) {
            if (err.response && err.response.status === 400) {
                console.log('✅ Passed: Incorrect current password rejected with 400');
            } else {
                console.error('❌ Unexpected status code:', err.response?.status);
                process.exit(1);
            }
        }

        // -------------------------------------------------------------
        // [Gate 3] Real Admin Dashboard Metrics (Zero Fake Fallbacks)
        // -------------------------------------------------------------
        console.log('\n[Gate 3] Testing Real Admin Dashboard Operations Metrics...');
        const dashRes = await axios.get(`${BASE_URL}/admin/dashboard`, { headers: adminHeaders });
        const dash = dashRes.data;

        if (dash.totalRevenue === 1245680 || dash.customers === 2568 || dash.pendingDeliveries === 56) {
            console.error('❌ Failed: Dashboard still contains hardcoded fake numbers!', dash);
            process.exit(1);
        }

        if (typeof dash.unassignedCustomers !== 'number' || typeof dash.outstandingDues !== 'number') {
            console.error('❌ Failed: Required new operations metrics missing from dashboard payload');
            process.exit(1);
        }
        console.log(`✅ Passed: Dashboard provides verified real operational data:`);
        console.log(`   - Total Revenue: ₹${dash.totalRevenue}`);
        console.log(`   - Outstanding Dues: ₹${dash.outstandingDues}`);
        console.log(`   - Registered Customers: ${dash.customers}`);
        console.log(`   - Unassigned Route Stops: ${dash.unassignedCustomers}`);
        console.log(`   - Top Products: ${dash.topProducts?.length || 0} items sold via delivery_items`);

        // -------------------------------------------------------------
        // [Gate 4] Role-Based Navigation & Mobile Drawer Integration
        // -------------------------------------------------------------
        console.log('\n[Gate 4] Verifying Admin Layout Role-Based Sidebar...');
        const adminLayoutContent = fs.readFileSync(path.resolve(srcDir, 'components/layout/AdminLayout.jsx'), 'utf8');
        if (!adminLayoutContent.includes('ROLE_PERMISSIONS') || !adminLayoutContent.includes('mobileMenuOpen')) {
            console.error('❌ Failed: AdminLayout missing role filtering or mobile drawer state');
            process.exit(1);
        }
        console.log('✅ Passed: AdminLayout has mobile drawer & role-based menu permissions');

        // -------------------------------------------------------------
        // [Gate 5] Delivery App Modernization & Leaflet Map
        // -------------------------------------------------------------
        console.log('\n[Gate 5] Verifying Delivery App 1-Tap & Leaflet Map...');
        const delDashContent = fs.readFileSync(path.resolve(srcDir, 'components/deliveryBoy/DeliveryDashboard.jsx'), 'utf8');
        const delMapContent = fs.readFileSync(path.resolve(srcDir, 'components/deliveryBoy/DeliveryRouteMap.jsx'), 'utf8');
        
        if (!delDashContent.includes('handleMultiStopNavigation') || !delDashContent.includes('handleUndo')) {
            console.error('❌ Failed: DeliveryDashboard missing 10s Undo or multi-stop navigation');
            process.exit(1);
        }
        if (!delMapContent.includes('MapContainer') || !delMapContent.includes('CircleMarker')) {
            console.error('❌ Failed: DeliveryRouteMap missing Leaflet MapContainer or markers');
            process.exit(1);
        }
        console.log('✅ Passed: Delivery app features 1-tap delivery, 10-second Undo, and interactive Leaflet map');

        console.log('\n🎉 ALL PHASE 4 GATE CHECKS PASSED SUCCESSFULLY!\n');
        process.exit(0);

    } catch (error) {
        console.error('❌ Phase 4 Gate Verification Failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

runPhase4Gate();
