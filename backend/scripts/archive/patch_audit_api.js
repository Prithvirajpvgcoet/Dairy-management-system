const fs = require('fs');

let ac = fs.readFileSync('src/controllers/adminController.js', 'utf8');

const auditLogCode = `
const getAuditLogs = async (req, res) => {
    try {
        const [logs] = await pool.query(\`
            SELECT a.*, u.name as user_name, u.role as user_role 
            FROM audit_log a
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY a.created_at DESC
            LIMIT 100
        \`);
        res.json(logs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
`;

ac = ac.replace('module.exports = {', auditLogCode + '\nmodule.exports = {\n  getAuditLogs,');
fs.writeFileSync('src/controllers/adminController.js', ac);

let ar = fs.readFileSync('src/routes/adminRoutes.js', 'utf8');
ar = ar.replace('const { \n    getDashboard,', 'const { \n    getDashboard,\n    getAuditLogs,');
ar = ar.replace('router.get(\'/dashboard\', authorize(\'ADMIN\', \'INVENTORY_MNGR\', \'BILLING_CLERK\', \'SUPPORT\'), getDashboard);', 'router.get(\'/dashboard\', authorize(\'ADMIN\', \'INVENTORY_MNGR\', \'BILLING_CLERK\', \'SUPPORT\'), getDashboard);\nrouter.get(\'/audit-logs\', authorize(\'ADMIN\'), getAuditLogs);');
fs.writeFileSync('src/routes/adminRoutes.js', ar);

console.log('patched admin APIs for audit logs');
