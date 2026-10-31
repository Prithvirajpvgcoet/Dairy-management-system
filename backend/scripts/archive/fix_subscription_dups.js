const fs = require('fs');
let c = fs.readFileSync('src/controllers/subscriptionController.js', 'utf8');

// Remove duplicate declarations inserted mid-file by patch scripts
c = c.replace(/\n\nconst pool = require\('\.\.\/config\/db'\);\nconst \{ notifyAdminAndDeliveryBoy \} = require\('\.\.\/services\/notificationService'\);\n\n\/\/ ─── 1\./g, '\n\n// ─── 1.');

// Also remove any other duplicate const pool declarations (keep only the first one)
const firstPool = c.indexOf("const pool = require('../config/db');");
const secondPool = c.indexOf("const pool = require('../config/db');", firstPool + 1);
if (secondPool !== -1) {
    const endOfLine = c.indexOf('\n', secondPool);
    c = c.substring(0, secondPool) + c.substring(endOfLine + 1);
}

// Same for notifyAdminAndDeliveryBoy
const firstNotify = c.indexOf("const { notifyAdminAndDeliveryBoy }");
const secondNotify = c.indexOf("const { notifyAdminAndDeliveryBoy }", firstNotify + 1);
if (secondNotify !== -1) {
    const endOfLine = c.indexOf('\n', secondNotify);
    c = c.substring(0, secondNotify) + c.substring(endOfLine + 1);
}

fs.writeFileSync('src/controllers/subscriptionController.js', c);
console.log('fixed subscriptionController.js duplicate declarations');
