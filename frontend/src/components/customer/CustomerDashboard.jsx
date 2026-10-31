import React, { useState, useEffect } from 'react';
import { Package, Clock, CreditCard, Droplets, Loader2, FileText, Headphones, MapPin, Truck, Wallet, Plus, CalendarOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/client';
import StatusBadge from '../common/StatusBadge';

export default function CustomerDashboard() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [walletBalance, setWalletBalance] = useState('0.00');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [accRes, ordersRes, walletRes] = await Promise.allSettled([
        api.get('/customer/account'),
        api.get('/customer/orders'),
        api.get('/customer/wallet')
      ]);

      if (accRes.status === 'fulfilled') {
        setUserProfile(accRes.value.data);
      }
      if (ordersRes.status === 'fulfilled') {
        setDashboardData(ordersRes.value.data);
      }
      if (walletRes.status === 'fulfilled') {
        setWalletBalance(walletRes.value.data?.balance || '0.00');
      }
    } catch (error) {
      console.error("Failed to fetch customer dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D47A1]" />
      </div>
    );
  }

  const userName = userProfile?.name || 'Customer';
  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'CU';
  
  // Format tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextDeliveryDate = tomorrow.toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="md:p-2 bg-slate-50 min-h-full font-['Poppins']">
      
      {/* ─── MOBILE PROFILE BAR ─── */}
      <div className="px-5 pt-6 pb-4 flex md:hidden items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#0D47A1] text-white flex items-center justify-center font-black shadow-md text-base">
            {getInitials(userName)}
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">{userName}</h2>
            <p className="text-[11px] text-slate-500 font-medium flex items-center">
              <MapPin className="w-3 h-3 mr-0.5 text-slate-400" /> Pune, Maharashtra
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 md:px-0 space-y-6 max-w-6xl mx-auto pb-12">
        
        {/* ─── HERO BANNER ─── */}
        <div className="bg-[#0D47A1] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg shadow-blue-900/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-2xl"></div>
          
          <div className="relative z-10 w-[70%] sm:w-[60%]">
            <h2 className="text-xl md:text-2xl font-extrabold mb-2 leading-snug">
              Farm-Fresh Milk Delivered Daily
            </h2>
            <p className="text-xs text-blue-100 mb-4 max-w-md">Pure A2 Cow & Buffalo milk straight from Amarale Farms to your doorstep every morning.</p>
            <Link to="/customer/requirement" className="inline-block bg-white text-[#0D47A1] px-5 py-2 rounded-xl font-bold text-xs shadow-md hover:bg-blue-50 transition-colors">
              Manage Daily Delivery
            </Link>
          </div>
          
          <div className="absolute -right-4 -bottom-6 md:right-8 md:-bottom-8 w-[40%] h-[130%] z-0 flex items-end justify-end opacity-90">
            <img src="/images/product2.png" alt="Milk" className="w-full h-full object-contain object-right-bottom drop-shadow-xl" />
          </div>
        </div>

        {/* ─── REAL METRIC CARDS (NEXT DELIVERY & WALLET) ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Next Delivery Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6 text-[#0D47A1]" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Next Delivery</p>
                <p className="text-sm font-extrabold text-slate-800">{nextDeliveryDate}</p>
                <p className="text-[11px] text-emerald-600 font-bold mt-0.5">Morning Slot (before 7:00 AM)</p>
              </div>
            </div>
            <Link 
              to="/customer/requirement"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors"
            >
              Skip
            </Link>
          </div>
          
          {/* Wallet Balance Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Wallet className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Wallet Credit</p>
                <p className="text-lg font-black text-emerald-600">₹{parseFloat(walletBalance).toFixed(2)}</p>
                <p className="text-[11px] text-slate-400 font-medium">Auto-applied on monthly invoice</p>
              </div>
            </div>
            <Link 
              to="/customer/bills"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors"
            >
              My Bills
            </Link>
          </div>
        </div>

        {/* ─── QUICK SHORTCUTS ─── */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Droplets, label: 'Subscriptions', link: '/customer/requirement' },
            { icon: Package, label: 'One-Time Milk', link: '/customer/orders' },
            { icon: FileText, label: 'Monthly Bills', link: '/customer/bills' },
            { icon: Headphones, label: 'Profile & Help', link: '/customer/account' }
          ].map((item, i) => (
            <Link key={i} to={item.link} className="flex flex-col items-center group p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-[#0D47A1] mb-2 group-hover:bg-blue-50 transition-colors">
                <item.icon className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* ─── RECENT DELIVERIES ─── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Recent Deliveries</h3>
              <p className="text-xs text-slate-400">Your doorstep delivery history</p>
            </div>
            <Link to="/customer/orders" className="text-xs font-bold text-[#0D47A1] hover:underline">
              View All History
            </Link>
          </div>
          
          {dashboardData?.pastOrders?.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">No recent deliveries found.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {dashboardData?.pastOrders?.slice(0, 4).map(order => (
                <div key={order.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${order.status === 'DELIVERED' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {new Date(order.date).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-[11px] text-slate-400">Delivered by {order.delivery_boy || 'Amarale Fleet'}</p>
                    </div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
