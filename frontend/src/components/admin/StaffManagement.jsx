import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Phone, Mail, Loader2, Save, X } from 'lucide-react';
import api from '../../api/client';


const StaffManagement = () => {
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    salary_type: 'FIXED',
    salary_rate: '5000'
  });

  useEffect(() => {
    fetchDeliveryBoys();
  }, []);

  const fetchDeliveryBoys = async () => {
    try {
      const res = await api.get('/admin/delivery-boys');
      if (res) {
        const data = res.data;
        setDeliveryBoys(data);
      }
    } catch (error) {
      console.error("Failed to fetch delivery boys:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/admin/delivery-boys', formData);
      if (res) {
        setShowAddModal(false);
        setFormData({ name: '', phone: '', email: '', password: '', salary_type: 'FIXED', salary_rate: '5000' });
        fetchDeliveryBoys();
      }
    } catch (error) {
      console.error("Failed to add delivery boy:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage delivery partners and their payroll settings.</p>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#1551b5] hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition flex items-center text-sm"
        >
          <UserPlus className="w-4 h-4 mr-2" /> Add Delivery Partner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           <div className="col-span-full flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#1551b5]" /></div>
        ) : deliveryBoys.length === 0 ? (
           <div className="col-span-full text-center py-12 text-gray-500">No delivery partners found. Add one to get started.</div>
        ) : (
          deliveryBoys.map(boy => (
            <div key={boy.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-[#1551b5]">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{boy.name}</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#1551b5] bg-blue-50 px-2 py-0.5 rounded-full">Partner ID: #{boy.id}</span>
                </div>
              </div>
              
              <div className="space-y-2 mt-2 mb-4 flex-grow">
                <p className="flex items-center text-sm text-gray-600"><Phone className="w-4 h-4 mr-2 text-gray-400" /> {boy.phone}</p>
                <p className="flex items-center text-sm text-gray-600"><Mail className="w-4 h-4 mr-2 text-gray-400" /> {boy.email}</p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <div>
                   <p className="text-[10px] text-gray-500 uppercase font-semibold">Salary Structure</p>
                   <p className="text-sm font-bold text-gray-800">{boy.salary_type.replace(/_/g, ' ')}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] text-gray-500 uppercase font-semibold">Rate</p>
                   <p className="text-sm font-bold text-green-600">₹{boy.salary_rate}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Add Delivery Partner</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[#1551b5] focus:border-[#1551b5] text-sm outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[#1551b5] focus:border-[#1551b5] text-sm outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[#1551b5] focus:border-[#1551b5] text-sm outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Initial Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[#1551b5] focus:border-[#1551b5] text-sm outline-none" required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Salary Type</label>
                  <select name="salary_type" value={formData.salary_type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[#1551b5] focus:border-[#1551b5] text-sm outline-none font-semibold text-gray-700">
                    <option value="FIXED">Fixed</option>
                    <option value="PER_LITER">Per Liter</option>
                    <option value="FIXED_PLUS_INCENTIVE">Fixed + Incentive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Rate (₹)</label>
                  <input type="number" name="salary_rate" value={formData.salary_rate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[#1551b5] focus:border-[#1551b5] text-sm outline-none" required />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-semibold text-white bg-[#1551b5] hover:bg-blue-800 rounded-lg flex items-center transition disabled:opacity-50">
                  {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
