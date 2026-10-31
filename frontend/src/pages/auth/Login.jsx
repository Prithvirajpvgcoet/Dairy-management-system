import React, { useState } from 'react';
import { LogIn, UserPlus, ShieldCheck, Truck, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';


const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('customer'); // 'customer', 'delivery', 'admin'
  const [isSignup, setIsSignup] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsSignup(false);
    setError('');
  };

  const isSignupFlow = (activeTab === 'customer' || activeTab === 'delivery') && isSignup;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isSignupFlow ? '/auth/signup' : '/auth/login';
    
    try {
      const payload = isSignupFlow 
        ? { ...formData, role: activeTab === 'delivery' ? 'DELIVERY_BOY' : 'CUSTOMER' }
        : { email: formData.email, password: formData.password };
        
      const response = await api.post(endpoint, payload);
      
      const data = response.data;
      
      if (response) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        
        if (!isSignupFlow) {
           if (activeTab === 'admin' && data.role !== 'ADMIN') {
              setError('Access denied: Not an admin account.');
              return;
           }
           if (activeTab === 'delivery' && data.role !== 'DELIVERY_BOY') {
              setError('Access denied: Not a delivery partner account.');
              return;
           }
        }
        
        if (data.role === 'ADMIN') navigate('/admin');
        else if (data.role === 'DELIVERY_BOY') navigate('/delivery');
        else navigate('/customer');
      }
    } catch (err) {
      console.error('Error during authentication:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Could not connect to the server');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-gray-100 overflow-hidden">
        
        {/* Role Tabs */}
        <div className="flex bg-gray-50 border-b border-gray-100">
          <button 
            type="button"
            onClick={() => handleTabChange('customer')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-colors ${activeTab === 'customer' ? 'bg-white text-[#1551b5] border-t-2 border-[#1551b5]' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <User className="w-4 h-4 mr-2" /> Customer
          </button>
          <button 
            type="button"
            onClick={() => handleTabChange('delivery')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-colors ${activeTab === 'delivery' ? 'bg-white text-[#1551b5] border-t-2 border-[#1551b5]' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Truck className="w-4 h-4 mr-2" /> Delivery
          </button>
          <button 
            type="button"
            onClick={() => handleTabChange('admin')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-colors ${activeTab === 'admin' ? 'bg-white text-[#1551b5] border-t-2 border-[#1551b5]' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <ShieldCheck className="w-4 h-4 mr-2" /> Admin
          </button>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-[#1551b5] mb-2">
              {activeTab === 'admin' ? 'Admin Portal' : 
               activeTab === 'delivery' ? 'Partner Login' : 
               (isSignup ? 'Create Account' : 'Welcome Back')}
            </h2>
            <p className="text-gray-500 font-medium text-sm">
              {activeTab === 'admin' ? 'Login to manage the dairy operations.' : 
               activeTab === 'delivery' ? 'Login to view your daily delivery route.' : 
               (isSignup ? 'Sign up to start fresh milk deliveries.' : 'Log in to manage your dairy deliveries.')}
            </p>
          </div>
          
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm font-semibold rounded-lg text-center">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {isSignupFlow && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1551b5] focus:border-[#1551b5] transition outline-none text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1551b5] focus:border-[#1551b5] transition outline-none text-sm" required />
                </div>
                {activeTab === 'customer' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Delivery Address</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Your complete address..." className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1551b5] focus:border-[#1551b5] transition outline-none text-sm resize-none" rows="2" required></textarea>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1551b5] focus:border-[#1551b5] transition outline-none text-sm" required />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1551b5] focus:border-[#1551b5] transition outline-none text-sm" required />
            </div>

            <button type="submit" disabled={loading} className="w-full flex justify-center items-center py-3 px-4 bg-[#1551b5] hover:bg-blue-800 text-white rounded-lg font-bold transition duration-200 shadow-md disabled:opacity-70 mt-4">
              {isSignupFlow ? 
                <><UserPlus className="w-5 h-5 mr-2" /> {loading ? 'Creating...' : 'Sign Up'}</> : 
                <><LogIn className="w-5 h-5 mr-2" /> {loading ? 'Signing In...' : 'Sign In'}</>}
            </button>
          </form>

          {(activeTab === 'customer' || activeTab === 'delivery') && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isSignup ? "Already have an account?" : "Don't have an account?"}{' '}
                <button 
                  type="button"
                  onClick={() => { setIsSignup(!isSignup); setError(''); }}
                  className="text-[#1551b5] font-bold hover:underline"
                >
                  {isSignup ? 'Log in here' : 'Sign up here'}
                </button>
              </p>
            </div>
          )}
          
          {activeTab === 'admin' && (
            <div className="mt-6 text-center">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                Authorized Personnel Only
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;
