/**
 * PHASE 5 GATE VERIFICATION SUITE — Dairy Management System
 * Tests public endpoints, plans pricing, contact/feedback/grievance inbox,
 * honeypot protection, customer plan subscription flow, and admin support inbox.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

const BASE_URL = 'http://localhost:5000/api';
let adminToken = '';
let customerToken = '';
let testCustomerId = null;

async function runGate5() {
  console.log('=== PHASE 5 GATE VERIFICATION ===\n');

  // [Setup] Authenticate
  const adminRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'admin@dairy.com',
    password: process.env.ADMIN_TEST_PASSWORD || 'Test@1234'
  });
  adminToken = adminRes.data.token;

  const custRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'amit@gmail.com',
    password: process.env.CUSTOMER_TEST_PASSWORD || 'Test@1234'
  });
  customerToken = custRes.data.token;

  const [cRows] = await pool.query('SELECT c.id FROM customers c JOIN users u ON c.user_id = u.id WHERE u.email = ?', ['amit@gmail.com']);
  testCustomerId = cRows[0]?.id;

  // ── [Gate 1] Public Catalog & Filtering ──
  console.log('[Gate 1] Testing Public Product Catalog & Category Filtering...');
  const allProductsRes = await axios.get(`${BASE_URL}/products`);
  if (!Array.isArray(allProductsRes.data) || allProductsRes.data.length < 5) {
    throw new Error(`Expected at least 5 products, got ${allProductsRes.data?.length}`);
  }
  const milkFilterRes = await axios.get(`${BASE_URL}/products?category=Milk`);
  const allAreMilk = milkFilterRes.data.every(p => p.category === 'Milk');
  if (!allAreMilk || milkFilterRes.data.length === 0) {
    throw new Error('Category filter failed: returned non-milk products');
  }
  console.log(`✅ Passed: Catalog returned ${allProductsRes.data.length} items; Milk category filtered ${milkFilterRes.data.length} items.`);

  // ── [Gate 2] Subscription Plans & Calculated Pricing ──
  console.log('\n[Gate 2] Testing Subscription Plans & Exact Pricing...');
  const plansRes = await axios.get(`${BASE_URL}/plans`);
  if (!Array.isArray(plansRes.data) || plansRes.data.length < 3) {
    throw new Error('Expected at least 3 subscription plans');
  }
  const starter = plansRes.data.find(p => p.name.includes('Starter'));
  if (!starter || starter.monthly_price <= 0) {
    throw new Error('Starter plan missing or has invalid monthly price');
  }
  console.log(`✅ Passed: Found ${plansRes.data.length} plans:`);
  plansRes.data.forEach(p => {
    console.log(`   - "${p.name}": ₹${p.monthly_price}/month (${p.items?.length || 0} items)`);
  });

  // ── [Gate 3] Contact Form, Feedback, Grievances & Honeypot ──
  console.log('\n[Gate 3] Testing Inquiries, Grievances & Honeypot Bot Shield...');
  // Valid Inquiry
  const contactRes = await axios.post(`${BASE_URL}/contact`, {
    name: 'Pooja Deshmukh',
    email: 'pooja.d@example.com',
    phone: '9822012345',
    message: 'We require 2 liters of pure cow milk in Kothrud starting next week.',
    kind: 'CONTACT'
  });
  if (!contactRes.data.success) throw new Error('Contact submission failed');

  // Valid Grievance
  const grievanceRes = await axios.post(`${BASE_URL}/contact`, {
    name: 'Anand Joshi',
    email: 'anand.j@example.com',
    phone: '9822099999',
    message: 'Delivery was delayed by 15 minutes on Sunday morning.',
    kind: 'GRIEVANCE'
  });
  if (!grievanceRes.data.success) throw new Error('Grievance submission failed');

  // Honeypot Bot Trap
  const botRes = await axios.post(`${BASE_URL}/contact`, {
    name: 'Spam Bot 3000',
    email: 'bot@spam.com',
    phone: '1234567890',
    message: 'Buy cheap watches online',
    kind: 'CONTACT',
    website: 'https://spamsite.xyz' // Honeypot filled
  });
  if (botRes.status !== 200) throw new Error('Honeypot bot shield failed');
  const [botCheck] = await pool.query('SELECT * FROM contact_messages WHERE email = ?', ['bot@spam.com']);
  if (botCheck.length > 0) throw new Error('Honeypot failed: bot submission was stored in database!');

  console.log('✅ Passed: Contact and Grievance stored; Honeypot bot trap successfully discarded spam.');

  // ── [Gate 4] Admin Support Messages Inbox & Status Management ──
  console.log('\n[Gate 4] Testing Admin Support Messages Inbox...');
  const msgRes = await axios.get(`${BASE_URL}/admin/messages`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  if (!Array.isArray(msgRes.data) || msgRes.data.length < 2) {
    throw new Error('Admin messages inbox did not return created messages');
  }
  const testMsg = msgRes.data[0];
  const updateRes = await axios.put(`${BASE_URL}/admin/messages/${testMsg.id}/status`, {
    status: 'IN_PROGRESS'
  }, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  if (!updateRes.data.success) throw new Error('Failed to update message status');
  console.log(`✅ Passed: Admin inbox verified (${msgRes.data.length} messages); Status updated to IN_PROGRESS.`);

  // ── [Gate 5] Customer Plan Subscription Conversion Flow ──
  console.log('\n[Gate 5] Testing Customer Subscription Conversion Flow...');
  const familyPlan = plansRes.data.find(p => p.name.includes('Family')) || plansRes.data[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDateStr = tomorrow.toISOString().split('T')[0];

  const subRes = await axios.post(`${BASE_URL}/customer/subscribe-plan`, {
    planId: familyPlan.id,
    startDate: tomorrowDateStr,
    deliverySlot: '5:30 AM - 7:00 AM'
  }, {
    headers: { Authorization: `Bearer ${customerToken}` }
  });

  if (!subRes.data.success) throw new Error('Subscribe plan failed: ' + subRes.data?.message);
  console.log(`✅ Passed: Customer subscribed to "${familyPlan.name}" starting ${tomorrowDateStr}`);
  console.log(`   Route message: "${subRes.data.routeMessage}"`);

  // Verify database record
  const [activeSubs] = await pool.query(
    "SELECT s.*, p.name AS product_name FROM subscriptions s JOIN products p ON s.product_id = p.id WHERE s.customer_id = ? AND s.status = 'ACTIVE'",
    [testCustomerId]
  );
  if (activeSubs.length === 0) throw new Error('No active subscriptions found for customer after subscription');
  console.log(`   Active subscriptions in DB: ${activeSubs.map(s => `${parseFloat(s.quantity_per_day)}L ${s.product_name}`).join(', ')}`);

  // ── [Gate 6] Frontend Alert Check ──
  console.log('\n[Gate 6] Checking for Zero alert() / window.confirm() in frontend/src...');
  const frontendSrc = path.join(__dirname, '../../frontend/src');
  function checkAlerts(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        checkAlerts(fullPath);
      } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
        const text = fs.readFileSync(fullPath, 'utf8');
        if (text.includes('alert(') || text.includes('window.confirm(')) {
          throw new Error(`Found disallowed alert/confirm in ${file}`);
        }
      }
    }
  }
  checkAlerts(frontendSrc);
  console.log('✅ Passed: Zero alert() or window.confirm() in frontend codebase.');

  console.log('\n🎉 ALL PHASE 5 GATE CHECKS PASSED SUCCESSFULLY!\n');
}

runGate5()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ PHASE 5 GATE FAILED:', err.message);
    if (err.response?.data) console.error('Response data:', err.response.data);
    process.exit(1);
  });
