import React, { useState, useEffect } from 'react';
import { Users, Search, MapPin, Package, UserCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/client';


const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [walletModal, setWalletModal] = useState(false);
  const [walletCustId, setWalletCustId] = useState('');
  const [walletAmount, setWalletAmount] = useState('');
  const [walletDesc, setWalletDesc] = useState('');
  
  const handleAddCredit = async () => {
    if (!walletAmount) return toast.error('Please enter an amount');
    try {
      await api.post('/admin/wallet/credit', { customer_id: walletCustId, amount: walletAmount, description: walletDesc });
      toast.success('Credit added to customer wallet!');
      setWalletModal(false);
      setWalletAmount(''); setWalletDesc('');
      fetchCustomers();
    } catch (e) {
      toast.error('Failed to add credit');
    }
  };

  const [activeTab, setActiveTab] = useState('CUSTOMERS'); // CUSTOMERS | QTY_REQUESTS
  const [qtyRequests, setQtyRequests] = useState([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
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
      await api.put(`/admin/quantity-change-requests/${id}`, { action, admin_note: note });
      toast.success(`Request ${action === 'APPROVE' ? 'Approved' : 'Rejected'}`);
      fetchCustomers();
    } catch (error) {
      toast.error('Action failed: ' + (error.response?.data?.message || error.message));
    }
  };


  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
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

    <div className="p-6 md:p-8 bg-slate-50 min-h-full font-['Poppins']">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customer Directory</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all registered customers and their subscriptions.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center">
          <div className="relative w-72">
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D47A1] focus:border-transparent"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="overflow-x-auto relative min-h-[300px]">
          {loading ? (
            <div className="absolute inset-0 flex justify-center items-center bg-white/50 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-[#0D47A1]" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 font-bold uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider">Address</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider">Active Subscription</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider">Assigned Partner</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0D47A1] flex flex-shrink-0 items-center justify-center font-bold mr-3">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{customer.name}</p>
                          <p className="text-xs text-gray-500">ID: #{customer.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center text-xs">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                        <span className="truncate max-w-[200px]">{customer.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-xs font-semibold text-[#0D47A1] bg-blue-50 px-2.5 py-1.5 rounded-lg w-fit border border-blue-100">
                        <Package className="w-3.5 h-3.5 mr-1.5" />
                        {customer.aggregated_requirements || 'No active subscription'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {customer.assigned_boy_name ? (
                        <div className="flex items-center text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-1.5 rounded-lg w-fit border border-gray-200">
                          <UserCheck className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                          {customer.assigned_boy_name}
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-red-500 bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-100">Unassigned</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default Customers;
