const fs = require('fs');
let c = fs.readFileSync('frontend/src/components/admin/Customers.jsx', 'utf8');

const walletState = `
  const [walletModal, setWalletModal] = useState(false);
  const [walletCustId, setWalletCustId] = useState('');
  const [walletAmount, setWalletAmount] = useState('');
  const [walletDesc, setWalletDesc] = useState('');
  
  const handleAddCredit = async () => {
    if (!walletAmount) return alert('Enter amount');
    try {
      await api.post('/admin/wallet/credit', { customer_id: walletCustId, amount: walletAmount, description: walletDesc });
      alert('Credit added to wallet');
      setWalletModal(false);
      setWalletAmount(''); setWalletDesc('');
      fetchCustomers();
    } catch (e) {
      alert('Failed to add credit');
    }
  };
`;

c = c.replace('const [searchTerm, setSearchTerm] = useState(\'\');', 'const [searchTerm, setSearchTerm] = useState(\'\');\n' + walletState);

// Add Wallet Balance column to Customers Table
c = c.replace('<th className="p-4 font-bold text-gray-500 rounded-tr-xl w-32">Actions</th>', '<th className="p-4 font-bold text-gray-500 text-right">Wallet</th>\n<th className="p-4 font-bold text-gray-500 rounded-tr-xl w-48">Actions</th>');

c = c.replace(
  '<td className="p-4">\n                      <div className="flex gap-2">',
  `<td className="p-4 text-right">
                      <span className="font-bold text-emerald-600">₹{parseFloat(c.wallet_balance || 0).toFixed(2)}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setWalletCustId(c.id); setWalletModal(true); }}
                          className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                        >
                          + Credit
                        </button>`
);

const walletModalUI = `
      {/* WALLET CREDIT MODAL */}
      {walletModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Wallet Credit</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount (₹)</label>
                <input type="number" value={walletAmount} onChange={e => setWalletAmount(e.target.value)} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input type="text" value={walletDesc} onChange={e => setWalletDesc(e.target.value)} placeholder="e.g. Advance payment" className="w-full border p-2 rounded" />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setWalletModal(false)} className="flex-1 bg-gray-100 py-2 rounded font-bold">Cancel</button>
                <button onClick={handleAddCredit} className="flex-1 bg-emerald-600 text-white py-2 rounded font-bold hover:bg-emerald-700">Add Credit</button>
              </div>
            </div>
          </div>
        </div>
      )}
`;

c = c.replace('return (', 'return (\n    <>' + walletModalUI);
c = c.replace('export default Customers;', '</>\n  );\n};\n\nexport default Customers;');
c = c.replace('      )}\n    </div>\n  );\n};\n\nexport default Customers;', '      )}\n    </div>\n    </>\n  );\n};\n\nexport default Customers;');

fs.writeFileSync('frontend/src/components/admin/Customers.jsx', c);
console.log('patched admin customers UI for wallet');
