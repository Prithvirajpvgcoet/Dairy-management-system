const pool = require('../config/db');
const { notifyAdminAndDeliveryBoy } = require('../services/notificationService');

// ─── 1. GET /customer/subscriptions ────────────────────────────────────────────
/**
 * Returns all ACTIVE subscriptions for the authenticated customer,
 * joined with product details (name, unit, price_per_unit).
 */
const getMySubscriptions = async (req, res) => {
  try {
    const [[customer]] = await pool.query(
      'SELECT id FROM customers WHERE user_id = ?',
      [req.user.id]
    );
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found.' });
    }

    const [subscriptions] = await pool.query(
      `SELECT
         s.id,
         s.quantity_per_day,
         s.price_per_unit,
         s.start_date,
         s.end_date,
         s.status,
         s.delivery_address,
         p.id   AS product_id,
         p.name AS product_name,
         p.unit AS product_unit
       FROM subscriptions s
       JOIN products p ON p.id = s.product_id
       WHERE s.customer_id = ?
         AND s.status = 'ACTIVE'
       ORDER BY s.start_date DESC`,
      [customer.id]
    );

    return res.status(200).json({ subscriptions });
  } catch (err) {
    console.error('[getMySubscriptions]', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// ─── 2. POST /customer/subscriptions ───────────────────────────────────────────
/**
 * Creates a new ACTIVE subscription for the authenticated customer.
 * Also upserts into customer_requirements for backward compatibility.
 *
 * Body: { product_id, quantity_per_day }
 */
const createSubscription = async (req, res) => {
  try {
    const { product_id, quantity_per_day } = req.body;

    if (!product_id || !quantity_per_day) {
      return res
        .status(400)
        .json({ message: 'product_id and quantity_per_day are required.' });
    }

    // Resolve customer record
    const [[customer]] = await pool.query(
      'SELECT id, address FROM customers WHERE user_id = ?',
      [req.user.id]
    );
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found.' });
    }

    // Resolve product price
    const [[product]] = await pool.query(
      'SELECT id, price_per_unit FROM products WHERE id = ?',
      [product_id]
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Insert subscription
    const [result] = await pool.query(
      `INSERT INTO subscriptions
         (customer_id, product_id, quantity_per_day, price_per_unit, start_date, status, delivery_address)
       VALUES (?, ?, ?, ?, CURDATE(), 'ACTIVE', ?)`,
      [customer.id, product.id, quantity_per_day, product.price_per_unit, customer.address]
    );

    const subscriptionId = result.insertId;

    // Upsert customer_requirements for backward compatibility
    await pool.query(
      `INSERT INTO customer_requirements (customer_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)`,
      [customer.id, product.id, quantity_per_day]
    );

    // Fetch the created record to return it
    const [[subscription]] = await pool.query(
      `SELECT
         s.id,
         s.customer_id,
         s.product_id,
         s.quantity_per_day,
         s.price_per_unit,
         s.start_date,
         s.end_date,
         s.status,
         s.delivery_address,
         p.name AS product_name,
         p.unit AS product_unit
       FROM subscriptions s
       JOIN products p ON p.id = s.product_id
       WHERE s.id = ?`,
      [subscriptionId]
    );

    return res.status(201).json({ subscription });
  } catch (err) {
    console.error('[createSubscription]', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// ─── 3. PUT /customer/subscriptions/:id ────────────────────────────────────────
/**
 * Updates quantity_per_day for an existing subscription.
 * Verifies the subscription belongs to the authenticated customer.
 * Also updates customer_requirements.quantity for consistency.
 *
 * Body: { quantity_per_day }
 */
const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity_per_day } = req.body;

    if (!quantity_per_day) {
      return res.status(400).json({ message: 'quantity_per_day is required.' });
    }

    // Resolve customer
    const [[customer]] = await pool.query(
      'SELECT id FROM customers WHERE user_id = ?',
      [req.user.id]
    );
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found.' });
    }

    // Fetch subscription and verify ownership
    const [[subscription]] = await pool.query(
      'SELECT id, product_id FROM subscriptions WHERE id = ? AND customer_id = ?',
      [id, customer.id]
    );
    if (!subscription) {
      return res
        .status(404)
        .json({ message: 'Subscription not found or access denied.' });
    }

    // Update subscription
    await pool.query(
      'UPDATE subscriptions SET quantity_per_day = ? WHERE id = ?',
      [quantity_per_day, id]
    );

    // Keep customer_requirements in sync
    await pool.query(
      `INSERT INTO customer_requirements (customer_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)`,
      [customer.id, subscription.product_id, quantity_per_day]
    );

    // Return updated record
    const [[updated]] = await pool.query(
      `SELECT
         s.id,
         s.customer_id,
         s.product_id,
         s.quantity_per_day,
         s.price_per_unit,
         s.start_date,
         s.end_date,
         s.status,
         s.delivery_address,
         p.name AS product_name,
         p.unit AS product_unit
       FROM subscriptions s
       JOIN products p ON p.id = s.product_id
       WHERE s.id = ?`,
      [id]
    );

    return res.status(200).json({ subscription: updated });
  } catch (err) {
    console.error('[updateSubscription]', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// ─── 4. POST /customer/subscriptions/:id/cancel ────────────────────────────────
/**
 * Cancels an active subscription by setting status = 'CANCELLED'
 * and end_date = CURDATE(). Also zeros out customer_requirements.quantity
 * for backward compatibility.
 */
const cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    // Resolve customer
    const [[customer]] = await pool.query(
      'SELECT id FROM customers WHERE user_id = ?',
      [req.user.id]
    );
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found.' });
    }

    // Verify ownership
    const [[subscription]] = await pool.query(
      'SELECT id, product_id FROM subscriptions WHERE id = ? AND customer_id = ?',
      [id, customer.id]
    );
    if (!subscription) {
      return res
        .status(404)
        .json({ message: 'Subscription not found or access denied.' });
    }

    // Cancel subscription
    await pool.query(
      `UPDATE subscriptions
       SET status = 'CANCELLED', end_date = CURDATE()
       WHERE id = ?`,
      [id]
    );

    // Zero out customer_requirements for backward compatibility
    await pool.query(
      `INSERT INTO customer_requirements (customer_id, product_id, quantity)
       VALUES (?, ?, 0)
       ON DUPLICATE KEY UPDATE quantity = 0`,
      [customer.id, subscription.product_id]
    );

    return res
      .status(200)
      .json({ message: 'Subscription cancelled successfully.' });
  } catch (err) {
    console.error('[cancelSubscription]', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// ─── 5. POST /customer/skip ────────────────────────────────────────────────────
/**
 * Submits a delivery skip request for a future date.
 * Validates skip_date >= today.
 * If a PENDING delivery record already exists for that date, marks it
 * as CUSTOMER_SKIPPED.
 *
 * Body: { skip_date, reason }
 */
const requestSkip = async (req, res) => {
  try {
    const { skip_date, skip_end_date, reason } = req.body;

    if (!skip_date) {
      return res.status(400).json({ message: 'skip_date is required.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const skipDateObj = new Date(skip_date);
    if (skipDateObj < today) {
      return res.status(400).json({ message: 'skip_date must be today or a future date.' });
    }

    const skipEndDateObj = skip_end_date ? new Date(skip_end_date) : skipDateObj;
    if (skipEndDateObj < skipDateObj) {
        return res.status(400).json({ message: 'End date cannot be before start date.' });
    }

    const diffTime = Math.abs(skipEndDateObj - skipDateObj);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
    if (diffDays > 60) {
        return res.status(400).json({ message: 'Cannot skip more than 60 days at once.' });
    }

    const [[customer]] = await pool.query(
      'SELECT id FROM customers WHERE user_id = ?',
      [req.user.id]
    );
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found.' });
    }

    let currentDate = new Date(skipDateObj);
    while (currentDate <= skipEndDateObj) {
        // Adjust for timezone issues by using local YYYY-MM-DD
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const targetDate = `${year}-${month}-${day}`;

        await pool.query(
          `INSERT IGNORE INTO delivery_skip_requests (customer_id, skip_date, reason, status)
           VALUES (?, ?, ?, 'APPROVED')`,
          [customer.id, targetDate, reason || null]
        );

        await pool.query(
          `UPDATE deliveries
           SET status = 'CUSTOMER_SKIPPED'
           WHERE customer_id = ? AND date = ? AND status = 'PENDING'`,
          [customer.id, targetDate]
        );

        currentDate.setDate(currentDate.getDate() + 1);
    }

    const dateMsg = diffDays > 1 ? `${skip_date} to ${skip_end_date} (${diffDays} days)` : skip_date;
    await notifyAdminAndDeliveryBoy(customer.id, 'Delivery Skipped', `Customer skipped delivery for ${dateMsg}`);

    return res.status(201).json({ message: `Delivery skipped successfully for ${dateMsg}.` });
  } catch (err) {
    console.error('[requestSkip]', err);
    return res.status(500).json({ message: 'Server error.', error: err.message });
  }
};
const getMySkips = async (req, res) => {
  try {
    const [[customer]] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const [skips] = await pool.query(
      `SELECT * FROM delivery_skip_requests WHERE customer_id = ? AND skip_date >= CURDATE() AND status = 'PENDING' ORDER BY skip_date ASC`,
      [customer.id]
    );
    return res.json(skips);
  } catch (err) {
    console.error('[getMySkips]', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const cancelSkip = async (req, res) => {
  try {
    const { id } = req.params;
    const [[customer]] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const [[skip]] = await pool.query('SELECT * FROM delivery_skip_requests WHERE id = ? AND customer_id = ?', [id, customer.id]);
    if (!skip) return res.status(404).json({ message: 'Skip not found' });
    if (skip.skip_date <= new Date().toISOString().split('T')[0]) {
      return res.status(400).json({ message: 'Cannot cancel a skip that has already passed' });
    }

    await pool.query('DELETE FROM delivery_skip_requests WHERE id = ?', [id]);

    // Also restore the delivery record if it was marked CUSTOMER_SKIPPED
    await pool.query(
      `UPDATE deliveries SET status = 'PENDING' WHERE customer_id = ? AND date = ? AND status = 'CUSTOMER_SKIPPED'`,
      [customer.id, skip.skip_date]
    );

    return res.json({ message: 'Skip cancelled successfully' });
  } catch (err) {
    console.error('[cancelSkip]', err);
    return res.status(500).json({ message: 'Server error' });
  }
};



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
      `INSERT INTO delivery_addons (customer_id, product_id, delivery_date, addon_quantity, price_per_unit, total_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING')`,
      [customer.id, product_id, delivery_date, quantity, product.price_per_unit, total]
    );

    const { notifyAdminAndDeliveryBoy } = require('../services/notificationService');
    await notifyAdminAndDeliveryBoy(
      customer.id,
      'Add-on Requested',
      `Customer requested extra ${quantity} units of product on ${delivery_date}`
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
      `SELECT a.*, p.name as product_name, p.unit as product_unit
       FROM delivery_addons a
       JOIN products p ON a.product_id = p.id
       WHERE a.customer_id = ? AND a.delivery_date >= CURDATE()
       ORDER BY a.delivery_date ASC`,
      [customer.id]
    );
    return res.json(addons);
  } catch (err) {
    console.error('[getMyAddons]', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getMySubscriptions, createSubscription, updateSubscription, cancelSubscription, requestSkip, getMySkips, cancelSkip, requestAddon, getMyAddons };
