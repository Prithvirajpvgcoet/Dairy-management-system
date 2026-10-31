const fs = require('fs');
let c = fs.readFileSync('frontend/src/components/admin/Customers.jsx', 'utf8');

c = c.replace('const [searchTerm, setSearchTerm] = useState(\'\');', 'const [searchTerm, setSearchTerm] = useState(\'\');\n  const [activeTab, setActiveTab] = useState(\'CUSTOMERS\'); // CUSTOMERS | QTY_REQUESTS\n  const [qtyRequests, setQtyRequests] = useState([]);');

c = c.replace(`  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/admin/customers');
      if (res) {
        const data = res.data;
        setCustomers(data);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  };`,
`  const fetchCustomers = async () => {
    try {
      const [custRes, qtyRes] = await Promise.all([
        api.get('/admin/customers'),
        api.get('/admin/quantity-change-requests')
      ]);
      if (custRes) setCustomers(custRes.data);
      if (qtyRes) setQtyRequests(qtyRes.data);
    } catch (error) {
      console.error("Failed to fetch customers/qty requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQtyRequest = async (id, action, note) => {
    try {
      await api.put(\`/admin/quantity-change-requests/\${id}\`, { action, admin_note: note });
      alert(\`Request \${action === 'APPROVE' ? 'Approved' : 'Rejected'}\`);
      fetchCustomers();
    } catch (error) {
      alert('Action failed');
    }
  };
`);

const tabsUI = `
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('CUSTOMERS')}
          className={\`px-6 py-2.5 rounded-xl font-bold transition-colors \${activeTab === 'CUSTOMERS' ? 'bg-[#0D47A1] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}\`}
        >
          Customer Directory
        </button>
        <button 
          onClick={() => setActiveTab('QTY_REQUESTS')}
          className={\`px-6 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 \${activeTab === 'QTY_REQUESTS' ? 'bg-[#0D47A1] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}\`}
        >
          Quantity Change Requests
          {qtyRequests.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{qtyRequests.length}</span>
          )}
        </button>
      </div>
`;

c = c.replace('<div className="p-6 md:p-8 bg-gray-50 min-h-screen">', '<div className="p-6 md:p-8 bg-gray-50 min-h-screen">\n' + tabsUI);

const qtyRenderUI = `
      {activeTab === 'QTY_REQUESTS' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {qtyRequests.length === 0 ? (
            <div className="p-10 text-center text-gray-500 font-medium">No pending requests</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-bold">Customer</th>
                  <th className="p-4 font-bold">Product</th>
                  <th className="p-4 font-bold">Change</th>
                  <th className="p-4 font-bold">Effective Date</th>
                  <th className="p-4 font-bold">Reason</th>
                  <th className="p-4 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {qtyRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{req.customer_name}</td>
                    <td className="p-4 text-gray-600 font-medium">{req.product_name}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="line-through text-gray-400">{req.current_quantity}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-bold text-blue-600">{req.requested_quantity}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-700">
                      {new Date(req.effective_date).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm text-gray-500">{req.reason || '-'}</td>
                    <td className="p-4 flex gap-2 justify-center">
                      <button onClick={() => handleQtyRequest(req.id, 'APPROVE', 'Approved by Admin')} className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-200">Approve</button>
                      <button onClick={() => handleQtyRequest(req.id, 'REJECT', 'Rejected by Admin')} className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
`;

c = c.replace('      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">', qtyRenderUI + '\n      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">');

c = c.replace('</div>\n    </div>\n  );\n};\n\nexport default Customers;', '</div>\n      )}\n    </div>\n  );\n};\n\nexport default Customers;');

fs.writeFileSync('frontend/src/components/admin/Customers.jsx', c);
console.log('patched admin Customers UI');
