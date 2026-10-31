import React, { useState, useEffect } from 'react';
import { Package, Clock, CreditCard, Droplets, Loader2, FileText, Headphones, MapPin, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

const CustomerDashboard = () => {
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const accRes = await api.get('/customer/account');
      if (accRes) {
        setUserName(accRes.data.name || 'User');
      }

      // We can reuse the orders endpoint to get history for the summary
      const res = await api.get('/customer/orders');
      if (res) {
        setDashboardData(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex flex-1 justify-center items-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-[#0D47A1]" /></div>;
  }

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'US';
  
  // Format tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextDeliveryDate = tomorrow.toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="md:p-2 bg-slate-50 min-h-full font-['Poppins']">
      
      {/* ─── HEADER IN-APP (MOBILE ONLY) ─── */}
      <div className="px-5 pt-6 pb-4 flex md:hidden items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#0D47A1] text-white flex items-center justify-center font-bold shadow-md text-lg">
            {getInitials(userName)}
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-gray-900">{userName}</h2>
            <p className="text-[10px] text-gray-500 font-medium flex items-center">
              <MapPin className="w-3 h-3 mr-0.5 text-gray-400" /> Pune, Maharashtra
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 md:px-0 space-y-6 max-w-6xl mx-auto">
        
        {/* ─── HERO BANNER ─── */}
        <div className="bg-[#0D47A1] rounded-3xl p-6 md:p-10 text-white relative overflow-hidden shadow-lg shadow-blue-900/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-2xl"></div>
          
          <div className="relative z-10 w-[60%] md:w-[70%]">
            <h2 className="text-xl md:text-3xl font-extrabold mb-4 md:mb-6 leading-snug">
              Purity, Trust & Taste in Every Drop.
            </h2>
            <Link to="/customer/requirement" className="inline-block bg-white text-[#0D47A1] px-6 py-2.5 rounded-full font-bold text-xs md:text-sm shadow-md hover:bg-blue-50 transition-colors">
              Manage Subscription
            </Link>
          </div>
          
          {/* Milk Splash Image */}
          <div className="absolute -right-4 -bottom-6 md:right-10 md:-bottom-10 w-[55%] md:w-[40%] h-[140%] z-0 flex items-end justify-end">
            <img src="/images/product2.png" alt="Milk Splash" className="w-full h-full object-contain object-right-bottom drop-shadow-xl scale-125 md:scale-100 translate-y-4 md:translate-y-0" />
          </div>
        </div>

        {/* ─── QUICK STATS ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mr-4">
              <Truck className="w-6 h-6 text-[#0D47A1]" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Next Delivery</p>
              <p className="text-base font-extrabold text-gray-800">{nextDeliveryDate}</p>
              <p className="text-[10px] text-green-600 font-bold mt-1">Scheduled before 7:00 AM</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mr-4">
              <CreditCard className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Monthly Billing</p>
              <p className="text-base font-extrabold text-gray-800">Post-paid</p>
              <p className="text-[10px] text-gray-500 font-medium mt-1">Bills are generated on the 1st of every month.</p>
            </div>
          </div>
        </div>

        {/* ─── QUICK LINKS ─── */}
        <div className="grid grid-cols-4 gap-4 py-2">
          {[
            { icon: Droplets, label: 'My Subscriptions', link: '/customer/requirement' },
            { icon: Package, label: 'One-Time Orders', link: '/customer/orders' },
            { icon: FileText, label: 'My Bills', link: '/customer/bills' },
            { icon: Headphones, label: 'Support', link: '/customer/account' }
          ].map((item, i) => (
            <Link key={i} to={item.link} className="flex flex-col items-center group">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-[#0D47A1] mb-3 group-hover:bg-blue-50 transition-colors">
                <item.icon className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <span className="text-[10px] md:text-xs font-bold text-gray-700 text-center leading-tight">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* ─── RECENT DELIVERIES (Snippet) ─── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-gray-900 text-lg">Recent Deliveries</h3>
            <Link to="/customer/orders" className="text-xs font-bold text-[#0D47A1]">View All</Link>
          </div>
          
          {dashboardData?.pastOrders?.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm">No recent deliveries found.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {dashboardData?.pastOrders?.slice(0, 3).map(order => (
                <div key={order.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${order.status === 'DELIVERED' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        {new Date(order.date).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-[10px] text-gray-500">By {order.delivery_boy || 'Pending'}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${order.status === 'DELIVERED' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CustomerDashboard;
