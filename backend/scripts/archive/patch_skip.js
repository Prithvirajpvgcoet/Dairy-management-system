const fs = require('fs');
let c = fs.readFileSync('src/controllers/subscriptionController.js', 'utf8');

const start = c.indexOf('const requestSkip');
const end = c.indexOf('// ─── 4. POST /customer/addons', start);

const replacement = `const requestSkip = async (req, res) => {
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
        const targetDate = \`\${year}-\${month}-\${day}\`;

        await pool.query(
          \`INSERT IGNORE INTO delivery_skip_requests (customer_id, skip_date, reason, status)
           VALUES (?, ?, ?, 'APPROVED')\`,
          [customer.id, targetDate, reason || null]
        );

        await pool.query(
          \`UPDATE deliveries
           SET status = 'CUSTOMER_SKIPPED'
           WHERE customer_id = ? AND date = ? AND status = 'PENDING'\`,
          [customer.id, targetDate]
        );

        currentDate.setDate(currentDate.getDate() + 1);
    }

    const dateMsg = diffDays > 1 ? \`\${skip_date} to \${skip_end_date} (\${diffDays} days)\` : skip_date;
    await notifyAdminAndDeliveryBoy(customer.id, 'Delivery Skipped', \`Customer skipped delivery for \${dateMsg}\`);

    return res.status(201).json({ message: \`Delivery skipped successfully for \${dateMsg}.\` });
  } catch (err) {
    console.error('[requestSkip]', err);
    return res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

`;

c = c.substring(0, start) + replacement + c.substring(end);
fs.writeFileSync('src/controllers/subscriptionController.js', c);
console.log('patched');
