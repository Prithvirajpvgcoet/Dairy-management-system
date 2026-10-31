import React, { useState, useEffect } from 'react';
import { UserPlus, Search, MapPin, Truck, Check, X, Loader2 } from 'lucide-react';
import api from '../../api/client';


const RouteAssignment = () => {
  const [selectedBoyId, setSelectedBoyId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [boysRes, custRes] = await Promise.all([
        api.get('/admin/delivery-boys'),
        api.get('/admin/customers')
      ]);
      
      if(boysRes && custRes) {
        const boysData = boysRes.data;
        const custData = custRes.data;
        setDeliveryBoys(boysData);
        setCustomers(custData);
        if(boysData.length > 0) setSelectedBoyId(boysData[0].id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (customerId, boyId) => {
    // Optimistic UI update
    setCustomers(customers.map(c => 
      c.id === customerId ? { ...c, assigned_boy_id: boyId, assigned_boy_name: deliveryBoys.find(b => b.id === boyId)?.name } : c
    ));

    // API Call
    try {
      const token = localStorage.getItem('token');
      await api.post('/admin/assign-route', { customerId, deliveryBoyId: boyId });
    } catch (error) {
      console.error("Error assigning route:", error);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
      return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#1551b5]" /></div>;
  }

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Route Assignment</h1>
          <p className="text-sm text-gray-500 mt-1">Assign customers to delivery boys for daily routes.</p>
        </div>
        <button className="bg-[#1551b5] text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-blue-800 transition flex items-center">
          <Check className="w-4 h-4 mr-2" /> Sync Records
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Column: Delivery Boys list */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-fit">
          <h3 className="font-bold text-gray-800 text-sm mb-4">Select Delivery Boy</h3>
          <div className="space-y-2">
            {deliveryBoys.map(boy => (
              <div 
                key={boy.id}
                onClick={() => setSelectedBoyId(boy.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center ${
                  selectedBoyId === boy.id 
                    ? 'border-[#1551b5] bg-blue-50/50' 
                    : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${selectedBoyId === boy.id ? 'bg-[#1551b5] text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${selectedBoyId === boy.id ? 'text-[#1551b5]' : 'text-gray-800'}`}>{boy.name}</h4>
                  <p className="text-[10px] text-gray-500">{customers.filter(c => c.assigned_boy_id === boy.id).length} customers assigned</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Customer List */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 text-sm">Customers</h3>
            
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search customers..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1551b5] focus:border-transparent w-64"
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
                      {!customer.assigned_boy_id && (
                        <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">Unassigned</span>
                      )}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" /> {customer.address}
                    </p>
                    <p className="text-xs font-semibold text-[#0D47A1] mt-1">{customer.aggregated_requirements || 'No active requirement'}</p>
                  </div>
                </div>
                
                <div>
                  {customer.assigned_boy_id === selectedBoyId ? (
                    <button 
                      onClick={() => handleAssign(customer.id, null)}
                      className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded flex items-center transition-colors"
                    >
                      <X className="w-3 h-3 mr-1" /> Remove
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleAssign(customer.id, selectedBoyId)}
                      className="px-3 py-1.5 bg-[#1551b5] text-white hover:bg-blue-800 text-xs font-bold rounded flex items-center transition-colors"
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
