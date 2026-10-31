const fs = require('fs');

let c = fs.readFileSync('frontend/src/components/admin/MonthlyBilling.jsx', 'utf8');

c = c.replace(
  'const handleGenerateBills = async () => {',
  `const handleDownloadPDF = async (billId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(\`/api/admin/bills/\${billId}/pdf\`, {
        headers: { 'Authorization': \`Bearer \${token}\` }
      });
      if (!response.ok) throw new Error('Failed to download PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = \`Dairy_Bill_\${billId}.pdf\`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Could not download PDF: ' + err.message);
    }
  };

  const handleGenerateBills = async () => {`
);

// We need to add the download button in the table.
// Let's find where the Finalize button is.
c = c.replace(
  '<button onClick={() => handleFinalizeBill(b.id)} className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-200">\n                              Finalize\n                            </button>',
  `<button onClick={() => handleFinalizeBill(b.id)} className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-200">
                              Finalize
                            </button>
                            <button onClick={() => handleDownloadPDF(b.id)} className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-200" title="Download PDF">
                              PDF
                            </button>`
);

// Add PDF to already finalized ones (if they show in UI)
c = c.replace(
  '<span className="text-gray-400 text-xs">-</span>',
  `<button onClick={() => handleDownloadPDF(b.id)} className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-200" title="Download PDF">
                              PDF
                            </button>`
);

fs.writeFileSync('frontend/src/components/admin/MonthlyBilling.jsx', c);
console.log('patched admin billing UI');
