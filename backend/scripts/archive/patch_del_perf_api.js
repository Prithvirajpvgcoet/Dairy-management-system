const fs = require('fs');

let dc = fs.readFileSync('src/controllers/deliveryController.js', 'utf8');

const myPerfCode = `
const getMyPerformance = async (req, res) => {
    try {
        const [[db]] = await pool.query('SELECT id FROM delivery_boys WHERE user_id = ?', [req.user.id]);
        if (!db) return res.status(404).json({ message: 'Delivery partner profile not found' });
        
        const [performance] = await pool.query(\`
            SELECT 
                COUNT(d.id) as total_assigned,
                SUM(CASE WHEN d.status = 'DELIVERED' THEN 1 ELSE 0 END) as total_delivered,
                SUM(CASE WHEN d.status = 'CUSTOMER_SKIPPED' THEN 1 ELSE 0 END) as total_skipped,
                SUM(CASE WHEN d.status IN ('NOT_DELIVERED', 'DELIVERY_FAILED') THEN 1 ELSE 0 END) as total_missed,
                ROUND((SUM(CASE WHEN d.status = 'DELIVERED' THEN 1 ELSE 0 END) / NULLIF(COUNT(d.id) - SUM(CASE WHEN d.status = 'CUSTOMER_SKIPPED' THEN 1 ELSE 0 END), 0)) * 100, 2) as on_time_rate
            FROM deliveries d
            WHERE d.delivery_boy_id = ? AND d.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        \`, [db.id]);
        
        res.json(performance[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
`;

dc = dc.replace('module.exports = {', myPerfCode + '\nmodule.exports = {\n  getMyPerformance,');
fs.writeFileSync('src/controllers/deliveryController.js', dc);

let dr = fs.readFileSync('src/routes/deliveryRoutes.js', 'utf8');
dr = dr.replace('const { getTodayRoute, getDeliverySummary, markDelivered } = require(\'../controllers/deliveryController\');', 'const { getTodayRoute, getDeliverySummary, markDelivered, getMyPerformance } = require(\'../controllers/deliveryController\');');
dr = dr.replace('module.exports = router;', 'router.get(\'/my-performance\', getMyPerformance);\n\nmodule.exports = router;');
fs.writeFileSync('src/routes/deliveryRoutes.js', dr);

console.log('Patched Delivery Performance API');
