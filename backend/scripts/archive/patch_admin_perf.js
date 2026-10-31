const fs = require('fs');

let ac = fs.readFileSync('src/controllers/adminController.js', 'utf8');
const adminPerfCode = `
const getDeliveryPerformance = async (req, res) => {
    try {
        const { month, year } = req.query; // optional
        let dateCondition = "WHERE d.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
        let queryParams = [];
        
        if (month && year) {
            dateCondition = "WHERE MONTH(d.date) = ? AND YEAR(d.date) = ?";
            queryParams = [month, year];
        }
        
        const [performance] = await pool.query(\`
            SELECT 
                db.id as delivery_boy_id,
                u.name,
                COUNT(d.id) as total_assigned,
                SUM(CASE WHEN d.status = 'DELIVERED' THEN 1 ELSE 0 END) as total_delivered,
                SUM(CASE WHEN d.status = 'CUSTOMER_SKIPPED' THEN 1 ELSE 0 END) as total_skipped,
                SUM(CASE WHEN d.status IN ('NOT_DELIVERED', 'DELIVERY_FAILED') THEN 1 ELSE 0 END) as total_missed,
                ROUND((SUM(CASE WHEN d.status = 'DELIVERED' THEN 1 ELSE 0 END) / NULLIF(COUNT(d.id) - SUM(CASE WHEN d.status = 'CUSTOMER_SKIPPED' THEN 1 ELSE 0 END), 0)) * 100, 2) as on_time_rate
            FROM delivery_boys db
            JOIN users u ON db.user_id = u.id
            LEFT JOIN deliveries d ON d.delivery_boy_id = db.id
            \${dateCondition.replace('WHERE', 'AND')}
            GROUP BY db.id, u.name
            ORDER BY on_time_rate DESC
        \`, queryParams);
        
        res.json(performance);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
`;

ac = ac.replace('module.exports = {', adminPerfCode + '\nmodule.exports = {\n  getDeliveryPerformance,');
fs.writeFileSync('src/controllers/adminController.js', ac);

let ar = fs.readFileSync('src/routes/adminRoutes.js', 'utf8');
ar = ar.replace('const { \n    getDashboard,', 'const { \n    getDashboard,\n    getDeliveryPerformance,');
ar = ar.replace('router.get(\'/dashboard\', getDashboard);', 'router.get(\'/dashboard\', getDashboard);\nrouter.get(\'/performance\', getDeliveryPerformance);');
fs.writeFileSync('src/routes/adminRoutes.js', ar);

// Now frontend for admin:
let appJSX = fs.readFileSync('../frontend/src/App.jsx', 'utf8');
appJSX = appJSX.replace('import RouteAssignment from \'./components/admin/RouteAssignment\';', 'import RouteAssignment from \'./components/admin/RouteAssignment\';\nimport Performance from \'./components/admin/Performance\';');
appJSX = appJSX.replace('<Route path="/admin/route" element={<RouteAssignment />} />', '<Route path="/admin/route" element={<RouteAssignment />} />\n                <Route path="/admin/performance" element={<Performance />} />');
fs.writeFileSync('../frontend/src/App.jsx', appJSX);

let adminLayout = fs.readFileSync('../frontend/src/components/layout/AdminLayout.jsx', 'utf8');
adminLayout = adminLayout.replace('{ name: \'Route Assignment\', icon: MapPin, path: \'/admin/route\' },', '{ name: \'Route Assignment\', icon: MapPin, path: \'/admin/route\' },\n    { name: \'Performance\', icon: MapPin, path: \'/admin/performance\' },'); // I'll change the icon in a sec
fs.writeFileSync('../frontend/src/components/layout/AdminLayout.jsx', adminLayout);

console.log('Patched Admin Performance API and Routes');
