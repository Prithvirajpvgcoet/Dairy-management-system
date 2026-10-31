import React, { useState, useEffect } from 'react';
import { Archive, Plus, AlertCircle, CheckCircle2, TrendingDown, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';

const Inventory = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addStockModals, setAddStockModals] = useState({});
  const [stockInput, setStockInput] = useState({});

  useEffect(() => {
    fetchInventory();
  }, [date]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/inventory?date=${date}`);
      if (res && res.data) {
        setInventory(res.data.inventory);
      }
    } catch (error) {
      console.error("Failed to fetch inventory", error);
      toast.error("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async (productId) => {
    const amount = parseFloat(stockInput[productId]);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await api.post('/admin/inventory', {
        date,
        product_id: productId,
        stock_in: amount
      });
      toast.success('Stock added successfully');
      setStockInput(prev => ({ ...prev, [productId]: '' }));
      setAddStockModals(prev => ({ ...prev, [productId]: false }));
      fetchInventory();
    } catch (error) {
      console.error(error);
      toast.error('Failed to add stock');
    }
  };

  if (loading) {
    return <div className="flex-1 flex justify-center items-center h-full min-h-screen bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-[#0D47A1]" /></div>;
  }

  const totalRequired = inventory.reduce((sum, item) => sum + item.required, 0);
  const totalAvailable = inventory.reduce((sum, item) => sum + item.total_available, 0);
  const deficitProducts = inventory.filter(item => item.total_available < item.required).length;

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-full font-['Poppins']">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
              <Archive className="w-6 h-6 text-[#0D47A1]" /> Daily Inventory Management
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Manage and track daily stock levels against customer requirements.</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 flex items-center">
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-4 py-2 bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Required Today</p>
              <h3 className="text-2xl font-extrabold text-gray-900">{totalRequired} <span className="text-sm text-gray-500 font-medium">units</span></h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-[#0D47A1]" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Available Stock</p>
              <h3 className="text-2xl font-extrabold text-gray-900">{totalAvailable} <span className="text-sm text-gray-500 font-medium">units</span></h3>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Deficit Alerts</p>
              <h3 className="text-2xl font-extrabold text-red-600">{deficitProducts} <span className="text-sm text-gray-500 font-medium">products short</span></h3>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Product Stock Levels</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Required</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Available</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inventory.map((item) => {
                  const deficit = item.required - item.total_available;
                  const isShort = deficit > 0;
                  
                  return (
                    <tr key={item.product_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-xl shadow-sm border border-blue-100">
                            {item.icon}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{item.name}</p>
                            <p className="text-xs font-medium text-gray-500">{item.unit} | ₹{item.price}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-extrabold text-gray-900 text-lg">{item.required}</span>
                        <span className="text-xs text-gray-500 ml-1 font-medium">units</span>
                      </td>
                      <td className="px-6 py-4">
                        
                          <span className={`font-extrabold text-lg ${isShort ? 'text-red-600' : item.total_available < 10 ? 'text-amber-500' : 'text-green-600'}`}>
                            {item.total_available}
                          </span>
                          {item.total_available < 10 && !isShort && (
                            <span className="ml-2 bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded font-bold">LOW STOCK</span>
                          )}
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                            <div className={`h-1.5 rounded-full ${isShort ? 'bg-red-500' : item.total_available < 10 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, (item.total_available / Math.max(item.required, 1)) * 100)}%` }}></div>
                          </div>

                        <span className="text-xs text-gray-500 ml-1 font-medium">units</span>
                      </td>
                      <td className="px-6 py-4">
                        {isShort ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                            <AlertCircle className="w-3.5 h-3.5 mr-1" /> Deficit of {deficit}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Sufficient
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!addStockModals[item.product_id] ? (
                          <button 
                            onClick={() => setAddStockModals(prev => ({ ...prev, [item.product_id]: true }))}
                            className="inline-flex items-center px-4 py-2 bg-[#0D47A1] text-white text-xs font-bold rounded-xl shadow-md hover:bg-blue-800 transition-colors"
                          >
                            <Plus className="w-4 h-4 mr-1" /> Add Stock
                          </button>
                        ) : (
                          <div className="flex items-center justify-end gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                            <input 
                              type="number"
                              placeholder="Qty"
                              value={stockInput[item.product_id] || ''}
                              onChange={(e) => setStockInput(prev => ({ ...prev, [item.product_id]: e.target.value }))}
                              className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold outline-none focus:border-[#0D47A1] focus:ring-1 focus:ring-[#0D47A1]"
                            />
                            <button 
                              onClick={() => handleAddStock(item.product_id)}
                              className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => setAddStockModals(prev => ({ ...prev, [item.product_id]: false }))}
                              className="px-3 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Inventory;
