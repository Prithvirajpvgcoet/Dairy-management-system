import React, { useState, useEffect } from 'react';
import { Calendar, Bell, Plus, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../../api/client';
import toast from 'react-hot-toast';

const Exceptions = () => {
  const [exceptions, setExceptions] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: '',
    type: 'SKIP',
    date: '',
    product_id: '',
    quantity: 1,
    reason: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [excRes, routeRes, custRes, prodRes] = await Promise.all([
        api.get('/admin/exceptions/upcoming'),
        api.get('/admin/exceptions/tomorrow-routes'),
        api.get('/admin/customers'),
        api.get('/admin/products')
      ]);
      setExceptions(excRes.data);
      setRoutes(routeRes.data.routes);
      setCustomers(custRes.data);
      setProducts(prodRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/exceptions/add', formData);
      toast.success('Record added successfully');
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add record');
    }
  };

  if (loading) return <div className="p-8 text-center"><Calendar className="animate-spin inline mr-2"/> Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Delivery Exceptions</h1>
          <p className="text-slate-500">Manage skips and add-ons, and view tomorrow's route changes.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center">
          <Plus className="w-5 h-5 mr-1" /> Add Record
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Tomorrow's Route Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold mb-4 flex items-center text-slate-800">
            <Bell className="w-5 h-5 mr-2 text-orange-500" /> Tomorrow's Alerts
          </h2>
          <div className="space-y-4">
            {routes.length === 0 ? (
              <p className="text-sm text-slate-500">No active delivery boys.</p>
            ) : routes.map(route => {
              const hasChanges = route.skipped_customers > 0 || route.addon_customers > 0;
              return (
                <div key={route.delivery_boy_id} className={`p-4 rounded-lg border ${hasChanges ? 'border-orange-200 bg-orange-50' : 'border-slate-100 bg-slate-50'}`}>
                  <div className="font-medium text-slate-800">{route.delivery_boy_name}</div>
                  <div className="text-sm text-slate-500 mt-1">
                    {route.skipped_customers} Skips • {route.addon_customers} Add-ons
                  </div>
                  {hasChanges && (
                    <button className="mt-3 text-sm px-3 py-1.5 bg-white border border-orange-200 text-orange-600 rounded shadow-sm w-full hover:bg-orange-100">
                      Notify Partner
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Col: Upcoming Exceptions Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">Upcoming Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exceptions.length === 0 ? (
                  <tr><td colSpan="4" className="p-6 text-center text-slate-500">No upcoming requests.</td></tr>
                ) : exceptions.map((exc, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(exc.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{exc.customer_name}</div>
                      <div className="text-slate-500 text-xs">{exc.customer_phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${exc.type === 'SKIP' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                        {exc.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {exc.type === 'SKIP' ? exc.reason || 'No reason' : `+${exc.quantity} ${exc.product_name}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Add Manual Record</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
                <select required className="w-full p-2 border border-slate-200 rounded-lg" value={formData.customer_id} onChange={e => setFormData({...formData, customer_id: e.target.value})}>
                  <option value="">Select Customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select className="w-full p-2 border border-slate-200 rounded-lg" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="SKIP">Skip Delivery</option>
                    <option value="ADDON">Extra Add-on</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input type="date" required className="w-full p-2 border border-slate-200 rounded-lg" min={new Date().toISOString().split('T')[0]} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>

              {formData.type === 'SKIP' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reason (Optional)</label>
                  <input type="text" className="w-full p-2 border border-slate-200 rounded-lg" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} placeholder="e.g. Travelling" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Product</label>
                    <select required className="w-full p-2 border border-slate-200 rounded-lg" value={formData.product_id} onChange={e => setFormData({...formData, product_id: e.target.value})}>
                      <option value="">Select Product</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                    <input type="number" required min="1" step="1" className="w-full p-2 border border-slate-200 rounded-lg" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                  </div>
                </div>
              )}

              <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 mt-6">
                Save Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exceptions;
