import React, { useState, useEffect } from 'react';
import { UserPlus, Search, MapPin, Truck, Check, X, Loader2, ArrowUp, ArrowDown, Compass, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';

const RouteAssignment = () => {
  const [selectedBoyId, setSelectedBoyId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [boysRes, custRes] = await Promise.all([
        api.get('/admin/delivery-boys'),
        api.get('/admin/customers')
      ]);
      
      if (boysRes && custRes) {
        const boysData = boysRes.data;
        const custData = custRes.data;
        setDeliveryBoys(boysData);
        setCustomers(custData);
        if (boysData.length > 0 && !selectedBoyId) setSelectedBoyId(boysData[0].id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error('Failed to load route data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (customerId, boyId) => {
    setCustomers(customers.map(c => 
      c.id === customerId ? { ...c, assigned_boy_id: boyId, assigned_boy_name: deliveryBoys.find(b => b.id === boyId)?.name } : c
    ));

    try {
      await api.post('/admin/assign-route', { customerId, deliveryBoyId: boyId });
      toast.success(boyId ? 'Customer assigned to route' : 'Customer unassigned');
    } catch (error) {
      console.error("Error assigning route:", error);
      toast.error('Failed to update assignment');
      fetchData();
    }
  };

  const handleOptimize = async () => {
    if (!selectedBoyId) return;
    setOptimizing(true);
    try {
      const res = await api.post('/admin/routes/optimize', { deliveryBoyId: selectedBoyId });
      toast.success(res.data.message || 'Route optimized by nearest-neighbor distance!');
      fetchData();
    } catch (err) {
      console.error('Optimization error:', err);
      toast.error('Failed to optimize route');
    } finally {
      setOptimizing(false);
    }
  };

  const handleGenerateDeliveries = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/admin/deliveries/generate');
      toast.success(`Generated deliveries for ${res.data.result?.generated || 0} customers!`);
    } catch (err) {
      console.error('Generation error:', err);
      toast.error('Failed to generate daily deliveries');
    } finally {
      setGenerating(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedBoy = deliveryBoys.find(b => b.id === selectedBoyId);
  const assignedToSelected = customers.filter(c => c.assigned_boy_id === selectedBoyId);

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#1551b5]" /></div>;
  }

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Route Assignment & Sequencing</h1>
          <p className="text-sm text-gray-500 mt-1">Assign customers to delivery boys and optimize daily delivery order.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleGenerateDeliveries} 
            disabled={generating}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-emerald-700 transition flex items-center text-sm disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Generate Today's Deliveries
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Column: Delivery Boys list */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-fit">
          <h3 className="font-bold text-gray-800 text-sm mb-4">Select Delivery Partner</h3>
          <div className="space-y-2">
            {deliveryBoys.map(boy => {
              const assignedCount = customers.filter(c => c.assigned_boy_id === boy.id).length;
              return (
                <div 
                  key={boy.id}
                  onClick={() => setSelectedBoyId(boy.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center justify-between ${
                    selectedBoyId === boy.id 
                      ? 'border-[#0D47A1] bg-blue-50/50' 
                      : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${selectedBoyId === boy.id ? 'bg-[#0D47A1] text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${selectedBoyId === boy.id ? 'text-[#0D47A1]' : 'text-gray-800'}`}>{boy.name}</h4>
                      <p className="text-[10px] text-gray-500">{assignedCount} customers assigned</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedBoy && (
            <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-700">Selected Route:</span>
                <span className="text-xs font-bold text-[#0D47A1] bg-blue-50 px-2 py-0.5 rounded">{assignedToSelected.length} Stops</span>
              </div>
              <button
                onClick={handleOptimize}
                disabled={optimizing || assignedToSelected.length <= 1}
                className="w-full bg-[#0D47A1] hover:bg-blue-800 text-white py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center transition disabled:opacity-50"
              >
                {optimizing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Compass className="w-4 h-4 mr-2" />}
                Optimize Route (Nearest-Neighbour)
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Customer List */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 text-sm">Customers & Route Stops</h3>
            
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search customers..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D47A1] focus:border-transparent w-64"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="space-y-4">
            {filteredCustomers.map(customer => (
              <div key={customer.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-gray-500 font-bold text-sm mr-4 flex-shrink-0">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 flex items-center">
                      {customer.name}
                      {!customer.assigned_boy_id ? (
                        <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">Unassigned</span>
                      ) : (
                        <span className="ml-2 text-[10px] bg-blue-100 text-[#0D47A1] px-2 py-0.5 rounded font-bold">
                          Assigned: {customer.assigned_boy_name || 'Partner'}
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" /> {customer.address}
                    </p>
                    <p className="text-xs font-semibold text-[#0D47A1] mt-1">{customer.requirements || customer.aggregated_requirements || 'Standard Subscription'}</p>
                  </div>
                </div>
                
                <div>
                  {customer.assigned_boy_id === selectedBoyId ? (
                    <button 
                      onClick={() => handleAssign(customer.id, null)}
                      className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded flex items-center transition-colors"
                    >
                      <X className="w-3 h-3 mr-1" /> Remove from route
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleAssign(customer.id, selectedBoyId)}
                      className="px-3 py-1.5 bg-[#0D47A1] text-white hover:bg-blue-800 text-xs font-bold rounded flex items-center transition-colors"
                    >
                      <UserPlus className="w-3 h-3 mr-1" /> Assign to this route
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {filteredCustomers.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                No customers found matching your search.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default RouteAssignment;
