import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, LogOut, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';


const Account = () => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccount();
  }, []);

  const fetchAccount = async () => {
    try {
      const res = await api.get('/customer/account');
      if (res) {
        setAccount(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch account", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading || !account) {
      return <div className="flex-1 flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-[#1551b5]" /></div>;
  }

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'CU';

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-full">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
            <User className="w-5 h-5 text-[#1551b5]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">My Account</h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="bg-[#1551b5] h-24"></div>
          <div className="px-6 pb-6 relative">
            <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center text-[#1551b5] text-2xl font-bold absolute -top-10">
              {getInitials(account.name)}
            </div>
            
            <div className="pt-14">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{account.name}</h3>
                  <p className="text-sm text-gray-500 mb-6">Customer</p>
                </div>
                {account.subscriptionStatus && (
                  <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider border ${
                    account.subscriptionStatus === 'ACTIVE' ? 'bg-green-50 text-green-600 border-green-200' : 
                    account.subscriptionStatus === 'PENDING PAYMENT' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                    'bg-gray-50 text-gray-600 border-gray-200'
                  }`}>
                    {account.subscriptionStatus}
                  </span>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Email Address</p>
                    <p className="text-sm font-semibold text-gray-800">{account.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Phone Number</p>
                    <p className="text-sm font-semibold text-gray-800">{account.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Delivery Address</p>
                    <p className="text-sm font-semibold text-gray-800">{account.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold py-3 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center"
        >
          <LogOut className="w-5 h-5 mr-2" /> Log Out
        </button>
      </div>
    </div>
  );
};

export default Account;
