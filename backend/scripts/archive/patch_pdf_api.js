const fs = require('fs');

const code = `
const PDFDocument = require('pdfkit');

const downloadBillPDF = async (req, res) => {
    try {
        const { id } = req.params;
        const [[bill]] = await pool.query(\`
            SELECT b.*, c.address, u.name as customer_name, u.phone 
            FROM bills b
            JOIN customers c ON b.customer_id = c.id
            JOIN users u ON c.user_id = u.id
            WHERE b.id = ? AND u.id = ?
        \`, [id, req.user.id]);
        
        if (!bill) return res.status(404).json({ message: 'Bill not found' });
        
        const doc = new PDFDocument({ margin: 50 });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', \`attachment; filename="Dairy_Bill_\${bill.month}_\${bill.year}.pdf"\`);
        
        doc.pipe(res);
        
        // Header
        doc.fontSize(20).fillColor('#0D47A1').text('DAIRY MANAGEMENT SYSTEM', { align: 'center' });
        doc.fontSize(10).fillColor('#666666').text('Official Monthly Invoice', { align: 'center' });
        doc.moveDown();
        
        // Bill Details
        doc.fontSize(12).fillColor('#000000').text(\`Bill ID: #\${bill.id}\`);
        doc.text(\`Date Generated: \${new Date(bill.generated_date).toLocaleDateString()}\`);
        doc.text(\`Status: \${bill.status}\`);
        doc.text(\`Billing Period: \${bill.month}/\${bill.year}\`);
        doc.moveDown();
        
        // Customer Details
        doc.text(\`Customer Name: \${bill.customer_name}\`);
        doc.text(\`Phone: \${bill.phone}\`);
        doc.text(\`Address: \${bill.address || 'N/A'}\`);
        doc.moveDown();
        
        // Divider
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#CCCCCC');
        doc.moveDown();
        
        // Summary Table
        doc.fontSize(14).fillColor('#0D47A1').text('Usage Summary');
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#000000');
        
        doc.text(\`Total Days in Month: \${bill.total_days || 30}\`);
        doc.text(\`Delivered Days: \${bill.delivered_days || 0}\`);
        doc.text(\`Skipped/Missed Days: \${(bill.skipped_days || 0) + (bill.missed_days || 0)}\`);
        doc.text(\`Total Milk Quantity: \${bill.total_liters} Liters\`);
        doc.moveDown();
        
        // Cost Breakdown
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#CCCCCC');
        doc.moveDown();
        
        doc.text(\`Subscription Charges: Rs. \${parseFloat(bill.subscription_charge || 0).toFixed(2)}\`);
        if (bill.addon_charge > 0) {
            doc.text(\`Add-on Charges: Rs. \${parseFloat(bill.addon_charge).toFixed(2)}\`);
        }
        if (bill.adjustments != 0) {
            doc.text(\`Adjustments: Rs. \${parseFloat(bill.adjustments || 0).toFixed(2)}\`);
        }
        
        doc.moveDown();
        doc.fontSize(16).fillColor('#0D47A1').text(\`Total Amount Payable: Rs. \${parseFloat(bill.amount).toFixed(2)}\`, { underline: true });
        
        doc.moveDown(3);
        doc.fontSize(10).fillColor('#999999').text('Thank you for choosing our dairy service!', { align: 'center' });
        
        doc.end();
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Error generating PDF' });
        }
    }
};
`;

let cc = fs.readFileSync('src/controllers/customerController.js', 'utf8');
cc = cc.replace('module.exports = {', code + '\nmodule.exports = {\n  downloadBillPDF,');
fs.writeFileSync('src/controllers/customerController.js', cc);

let cr = fs.readFileSync('src/routes/customerRoutes.js', 'utf8');
cr = cr.replace('const { getDashboard, updateRequirements, requestQuantityChange, getOrders, getBills, getAccount, checkoutSubscription, checkoutOnetime, getMyWallet } = require(\'../controllers/customerController\');', 'const { getDashboard, updateRequirements, requestQuantityChange, getOrders, getBills, getAccount, checkoutSubscription, checkoutOnetime, getMyWallet, downloadBillPDF } = require(\'../controllers/customerController\');');
cr = cr.replace('router.get(\'/bills\', getBills);', 'router.get(\'/bills\', getBills);\nrouter.get(\'/bills/:id/pdf\', downloadBillPDF);');
fs.writeFileSync('src/routes/customerRoutes.js', cr);

console.log('Added PDF download API');
