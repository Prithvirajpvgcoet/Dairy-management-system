const fs = require('fs');

let c = fs.readFileSync('frontend/src/components/customer/Bills.jsx', 'utf8');

const walletState = `
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletHistory, setWalletHistory] = useState([]);
  const [showWalletHistory, setShowWalletHistory] = useState(false);
`;

c = c.replace('const [loading, setLoading] = useState(true);', 'const [loading, setLoading] = useState(true);' + walletState);

c = c.replace(
  'const res = await api.get(\'/customer/bills\');',
  `const [billsRes, walletRes] = await Promise.all([
        api.get('/customer/bills'),
        api.get('/customer/wallet').catch(() => null)
      ]);
      if (walletRes && walletRes.data) {
        setWalletBalance(walletRes.data.balance || 0);
        setWalletHistory(walletRes.data.transactions || []);
      }`
);
c = c.replace('setBills(res.data);', 'setBills(billsRes.data);');

const walletUI = `
        {/* Wallet Section */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-6 shadow-lg text-white mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">Advance Wallet Balance</p>
              <h3 className="text-3xl font-extrabold flex items-center gap-2">
                ₹{parseFloat(walletBalance).toFixed(2)}
              </h3>
              <p className="text-emerald-100 text-xs mt-1">Automatically deducted from your monthly bills</p>
            </div>
            <button 
              onClick={() => setShowWalletHistory(!showWalletHistory)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
            >
              {showWalletHistory ? 'Hide History' : 'View History'}
            </button>
          </div>
          
          {showWalletHistory && (
            <div className="mt-6 bg-white/10 rounded-2xl p-4 space-y-3">
              {walletHistory.length === 0 ? (
                <p className="text-sm text-emerald-100 text-center">No wallet transactions yet</p>
              ) : (
                walletHistory.slice(0, 5).map(txn => (
                  <div key={txn.id} className="flex justify-between items-center border-b border-white/10 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-bold">{txn.description}</p>
                      <p className="text-xs text-emerald-100">{new Date(txn.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className={\`text-sm font-bold \${txn.type === 'CREDIT' ? 'text-green-300' : 'text-red-300'}\`}>
                        {txn.type === 'CREDIT' ? '+' : '-'}₹{parseFloat(txn.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-emerald-100">Bal: ₹{parseFloat(txn.balance_after).toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
`;

c = c.replace('{/* Header */}', walletUI + '\n        {/* Header */}');

// Let's also patch the PDF download function to use our new backend route
c = c.replace(/const handleDownloadPDF = \(bill\) => \{[\s\S]*?\};\n/g, `
  const handleDownloadPDF = async (bill) => {
    try {
      // Create a temporary link to download the file directly from backend API
      const token = localStorage.getItem('token');
      // Fetch as blob
      const response = await fetch(\`/api/customer/bills/\${bill.id}/pdf\`, {
        headers: { 'Authorization': \`Bearer \${token}\` }
      });
      if (!response.ok) throw new Error('Failed to download PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = \`Dairy_Bill_\${bill.month}_\${bill.year}.pdf\`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Could not download PDF: ' + err.message);
    }
  };
`);

fs.writeFileSync('frontend/src/components/customer/Bills.jsx', c);
console.log('patched customer bills UI');
