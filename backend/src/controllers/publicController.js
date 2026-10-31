const pool = require('../config/db');
const { z } = require('zod');

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(150),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15),
  message: z.string().min(5, 'Message must be at least 5 characters').max(2000),
  kind: z.enum(['CONTACT', 'FEEDBACK', 'GRIEVANCE']).default('CONTACT'),
  website: z.string().optional() // Honeypot field for bot protection
});

// GET /api/products
const getProducts = async (req, res) => {
  try {
    const { category, search, popular } = req.query;
    let query = 'SELECT * FROM products WHERE is_active = 1';
    const params = [];

    if (category && category !== 'All' && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search && search.trim()) {
      query += ' AND name LIKE ?';
      params.push(`%${search.trim()}%`);
    }

    if (popular === 'true') {
      query += ' AND in_stock = 1 LIMIT 4';
    } else {
      query += ' ORDER BY id ASC';
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('getProducts error:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

// GET /api/plans
const getPlans = async (req, res) => {
  try {
    const [plans] = await pool.query('SELECT * FROM subscription_plans ORDER BY sort_order ASC');
    
    // Fetch items for all plans
    const [items] = await pool.query(`
      SELECT 
        spi.plan_id,
        spi.product_id,
        spi.quantity_per_day,
        p.name AS product_name,
        p.unit,
        p.price_per_unit,
        p.icon,
        p.image_url,
        p.category
      FROM subscription_plan_items spi
      JOIN products p ON spi.product_id = p.id
      ORDER BY spi.plan_id, p.id
    `);

    // Group items by plan_id and calculate monthly price
    const plansWithItems = plans.map(plan => {
      const planItems = items.filter(item => item.plan_id === plan.id);
      const calculatedDaily = planItems.reduce((sum, item) => {
        return sum + (parseFloat(item.quantity_per_day) * parseFloat(item.price_per_unit));
      }, 0);
      
      const calculatedMonthly = Math.round(calculatedDaily * 30);
      const displayPrice = plan.monthly_price_override 
        ? parseFloat(plan.monthly_price_override) 
        : calculatedMonthly;

      return {
        ...plan,
        is_popular: Boolean(plan.is_popular),
        is_custom: Boolean(plan.is_custom),
        items: planItems,
        daily_price: calculatedDaily,
        monthly_price: displayPrice
      };
    });

    res.json(plansWithItems);
  } catch (error) {
    console.error('getPlans error:', error);
    res.status(500).json({ message: 'Failed to fetch subscription plans' });
  }
};

// GET /api/faqs
const getFaqs = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM faqs ORDER BY sort_order ASC');
    res.json(rows);
  } catch (error) {
    console.error('getFaqs error:', error);
    res.status(500).json({ message: 'Failed to fetch FAQs' });
  }
};

// POST /api/contact
const submitContact = async (req, res) => {
  try {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0].message });
    }

    const { name, email, phone, message, kind, website } = parsed.data;

    // Honeypot bot protection: if bot filled hidden website field, return 200 silently
    if (website && website.trim().length > 0) {
      return res.status(200).json({ success: true, message: 'Message received' });
    }

    await pool.query(
      'INSERT INTO contact_messages (kind, name, email, phone, message) VALUES (?, ?, ?, ?, ?)',
      [kind || 'CONTACT', name, email, phone, message]
    );

    // Notify admin
    try {
      await pool.query(
        'INSERT INTO notifications (user_id, title, message) VALUES (1, ?, ?)',
        [`New ${kind} Received`, `From ${name} (${phone}, ${email}): "${message.substring(0, 100)}..."`]
      );
    } catch (e) {
      // non-blocking
    }

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received. Our team will get back to you shortly.'
    });
  } catch (error) {
    console.error('submitContact error:', error);
    res.status(500).json({ message: 'Failed to submit message' });
  }
};

// GET /api/track-order/:query
const trackOrder = async (req, res) => {
  try {
    const { query } = req.params;
    if (!query) {
      return res.status(400).json({ message: 'Please provide phone number or customer ID' });
    }

    const [customers] = await pool.query(
      'SELECT c.id, u.name, c.address, db.name AS delivery_partner FROM customers c JOIN users u ON c.user_id = u.id LEFT JOIN delivery_routes dr ON c.id = dr.customer_id LEFT JOIN delivery_boys db ON dr.delivery_boy_id = db.id WHERE u.phone = ? OR c.id = ?',
      [query, query]
    );

    if (customers.length === 0) {
      return res.status(404).json({ message: 'No customer account found with this phone number' });
    }

    const customer = customers[0];
    
    // Get today's delivery status if available
    const [deliveries] = await pool.query(
      'SELECT status, actual_quantity, delivered_at FROM deliveries WHERE customer_id = ? AND delivery_date = CURDATE()',
      [customer.id]
    );

    const todayDelivery = deliveries[0] || null;

    res.json({
      customerName: customer.name,
      address: customer.address,
      deliveryPartner: customer.delivery_partner || 'Assigning soon',
      todayStatus: todayDelivery ? todayDelivery.status : 'SCHEDULED_FOR_MORNING',
      deliveredAt: todayDelivery ? todayDelivery.delivered_at : null
    });
  } catch (error) {
    console.error('trackOrder error:', error);
    res.status(500).json({ message: 'Failed to track order' });
  }
};

module.exports = {
  getProducts,
  getPlans,
  getFaqs,
  submitContact,
  trackOrder
};
