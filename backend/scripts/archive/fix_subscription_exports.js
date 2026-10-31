const fs = require('fs');
let c = fs.readFileSync('src/controllers/subscriptionController.js', 'utf8');

// Check for getMySkips defined inside the file
const hasGetMySkips = c.includes('const getMySkips');
const hasCancelSkip = c.includes('const cancelSkip');

console.log('hasGetMySkips:', hasGetMySkips);
console.log('hasCancelSkip:', hasCancelSkip);

// Remove the broken partial module.exports at the end
const exportIdx = c.lastIndexOf('module.exports');
c = c.substring(0, exportIdx).trimEnd();

// Add proper exports
if (hasGetMySkips && hasCancelSkip) {
    c += '\n\nmodule.exports = { getMySubscriptions, createSubscription, updateSubscription, cancelSubscription, requestSkip, getMySkips, cancelSkip };\n';
} else {
    // getMySkips and cancelSkip were never added to this file - they need to be added
    const getMySkipsCode = `
const getMySkips = async (req, res) => {
  try {
    const [[customer]] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const [skips] = await pool.query(
      \`SELECT * FROM delivery_skip_requests WHERE customer_id = ? AND skip_date >= CURDATE() AND status = 'PENDING' ORDER BY skip_date ASC\`,
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
      \`UPDATE deliveries SET status = 'PENDING' WHERE customer_id = ? AND date = ? AND status = 'CUSTOMER_SKIPPED'\`,
      [customer.id, skip.skip_date]
    );

    return res.json({ message: 'Skip cancelled successfully' });
  } catch (err) {
    console.error('[cancelSkip]', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
`;
    c += getMySkipsCode;
    c += '\n\nmodule.exports = { getMySubscriptions, createSubscription, updateSubscription, cancelSubscription, requestSkip, getMySkips, cancelSkip };\n';
}

fs.writeFileSync('src/controllers/subscriptionController.js', c);
console.log('FIXED subscriptionController.js exports');
