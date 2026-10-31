const fs = require('fs');
let c = fs.readFileSync('src/controllers/subscriptionController.js', 'utf8');

const codeToAppend = `
const getMySkips = async (req, res) => {
  try {
    const [[customer]] = await pool.query(
      'SELECT id FROM customers WHERE user_id = ?',
      [req.user.id]
    );
    if (!customer) return res.status(404).json({ message: 'Customer profile not found.' });

    const [skips] = await pool.query(
      'SELECT * FROM delivery_skip_requests WHERE customer_id = ? AND skip_date >= CURDATE() ORDER BY skip_date ASC',
      [customer.id]
    );
    return res.json(skips);
  } catch (err) {
    console.error('[getMySkips]', err);
    return res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const cancelSkip = async (req, res) => {
  try {
    const [[customer]] = await pool.query(
      'SELECT id FROM customers WHERE user_id = ?',
      [req.user.id]
    );
    if (!customer) return res.status(404).json({ message: 'Customer profile not found.' });

    const skipId = req.params.id;
    const [[skipReq]] = await pool.query(
      'SELECT skip_date FROM delivery_skip_requests WHERE id = ? AND customer_id = ?',
      [skipId, customer.id]
    );

    if (!skipReq) return res.status(404).json({ message: 'Skip request not found.' });

    await pool.query('DELETE FROM delivery_skip_requests WHERE id = ?', [skipId]);

    // Restore PENDING status in deliveries if it hasn't passed
    const targetDate = skipReq.skip_date;
    const targetDateStr = targetDate.toISOString().split('T')[0];

    await pool.query(
      \`UPDATE deliveries SET status = 'PENDING' WHERE customer_id = ? AND date = ? AND status = 'CUSTOMER_SKIPPED'\`,
      [customer.id, targetDateStr]
    );

    return res.json({ message: 'Skip cancelled successfully.' });
  } catch (err) {
    console.error('[cancelSkip]', err);
    return res.status(500).json({ message: 'Server error.', error: err.message });
  }
};
`;

c = c.replace('module.exports = {', codeToAppend + '\nmodule.exports = {\n  getMySkips,\n  cancelSkip,');
fs.writeFileSync('src/controllers/subscriptionController.js', c);

let rc = fs.readFileSync('src/routes/customerRoutes.js', 'utf8');
rc = rc.replace('router.post(\'/addons\'', 'router.get(\'/skips\', subscriptionController.getMySkips);\nrouter.delete(\'/skips/:id\', subscriptionController.cancelSkip);\nrouter.post(\'/addons\'');
fs.writeFileSync('src/routes/customerRoutes.js', rc);

console.log('Added skips API');
