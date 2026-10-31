const fs = require('fs');

// ─── 1. subscriptionController.js ─────────────────────────────────────────────
// Add requestAddon and getMyAddons
let sc = fs.readFileSync('src/controllers/subscriptionController.js', 'utf8');

const addonCode = `
const requestAddon = async (req, res) => {
  try {
    const { product_id, delivery_date, quantity, reason } = req.body;
    if (!product_id || !delivery_date || !quantity) {
      return res.status(400).json({ message: 'product_id, delivery_date and quantity are required.' });
    }

    const [[customer]] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
    if (!customer) return res.status(404).json({ message: 'Customer not found.' });

    const [[product]] = await pool.query('SELECT price_per_unit FROM products WHERE id = ?', [product_id]);
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    const total = parseFloat(quantity) * parseFloat(product.price_per_unit);

    await pool.query(
      \`INSERT INTO delivery_addons (customer_id, product_id, delivery_date, addon_quantity, price_per_unit, total_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING')\`,
      [customer.id, product_id, delivery_date, quantity, product.price_per_unit, total]
    );

    const { notifyAdminAndDeliveryBoy } = require('../services/notificationService');
    await notifyAdminAndDeliveryBoy(
      customer.id,
      'Add-on Requested',
      \`Customer requested extra \${quantity} units of product on \${delivery_date}\`
    );

    return res.status(201).json({ message: 'Add-on request submitted for approval.' });
  } catch (err) {
    console.error('[requestAddon]', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

const getMyAddons = async (req, res) => {
  try {
    const [[customer]] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
    if (!customer) return res.status(404).json({ message: 'Customer not found.' });

    const [addons] = await pool.query(
      \`SELECT a.*, p.name as product_name, p.unit as product_unit
       FROM delivery_addons a
       JOIN products p ON a.product_id = p.id
       WHERE a.customer_id = ? AND a.delivery_date >= CURDATE()
       ORDER BY a.delivery_date ASC\`,
      [customer.id]
    );
    return res.json(addons);
  } catch (err) {
    console.error('[getMyAddons]', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};
`;

// Insert before module.exports
const exportIdx = sc.lastIndexOf('module.exports');
sc = sc.substring(0, exportIdx) + addonCode + '\nmodule.exports = { getMySubscriptions, createSubscription, updateSubscription, cancelSubscription, requestSkip, getMySkips, cancelSkip, requestAddon, getMyAddons };\n';
fs.writeFileSync('src/controllers/subscriptionController.js', sc);
console.log('[1] Fixed subscriptionController.js - added requestAddon, getMyAddons');

// ─── 2. customerController.js ──────────────────────────────────────────────────
// Check for duplicate declarations
let cc = fs.readFileSync('src/controllers/customerController.js', 'utf8');
const custFns = [...cc.matchAll(/^const (\w+) = async/gm)].map(m => m[1]);
console.log('[2] customerController functions:', custFns.join(', '));

// Fix module.exports if needed
const lastExportCC = cc.lastIndexOf('module.exports');
const exportBlock = cc.substring(lastExportCC);
console.log('[2] Current exports:', exportBlock.substring(0, 200));

// ─── 3. adminController.js ─────────────────────────────────────────────────────
let ac = fs.readFileSync('src/controllers/adminController.js', 'utf8');
const adminFns = [...ac.matchAll(/^const (\w+) = async/gm)].map(m => m[1]);
console.log('[3] adminController functions count:', adminFns.length);

// Validate all exported in module.exports
const lastExportAC = ac.lastIndexOf('module.exports');
const exportBlockAC = ac.substring(lastExportAC, lastExportAC + 500);
console.log('[3] Admin exports start:', exportBlockAC.substring(0, 300));

// ─── 4. deliveryController.js ──────────────────────────────────────────────────
let dc = fs.readFileSync('src/controllers/deliveryController.js', 'utf8');
const lastExportDC = dc.lastIndexOf('module.exports');
const exportBlockDC = dc.substring(lastExportDC, lastExportDC + 300);
console.log('[4] Delivery exports:', exportBlockDC);

console.log('\nAll checks done.');
