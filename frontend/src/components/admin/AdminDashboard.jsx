import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Users, Truck, Package, FileText, 
  Bell, Search, UserPlus, PackagePlus, Loader2, ArrowUpRight, 
  Clock, Activity, Zap, CheckCircle2, XCircle, AlertTriangle,
  IndianRupee, Milk, ShieldAlert
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend, AreaChart, Area 
} from 'recharts';
import { Link } from 'react-router-dom';
import api from '../../services/client';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-[#0D47A1] mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading operations metrics...</p>
        </div>
      </div>
    );
  }

  // Format currency
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const donutData = [
    { name: 'Delivered', value: data.ordersByStatus?.DELIVERED || 0, color: '#10B981' },
    { name: 'Pending', value: data.ordersByStatus?.PENDING || 0, color: '#3B82F6' },
    { name: 'Skipped', value: data.ordersByStatus?.SKIPPED || 0, color: '#94A3B8' },
    { name: 'Missed', value: data.ordersByStatus?.MISSED || 0, color: '#EF4444' },
  ].filter(d => d.value > 0);

  const weeklyData = (data.weeklyRevenue || []).map(r => ({
    date: typeof r.date === 'string' ? r.date.slice(5) : r.date,
    revenue: parseFloat(r.revenue || 0)
  }));

  return (
    <div className="space-y-6 font-['Poppins']">
      
      {/* ─── ACTION ALERTS ROW (Unassigned Customers & Low Stock) ─── */}
      <div className="flex flex-wrap items-center gap-3">
        {data.unassignedCustomers > 0 && (
          <Link 
            to="/admin/assign-route"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{data.unassignedCustomers} Customers unassigned to any delivery route</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-auto text-amber-600" />
          </Link>
        )}

        {data.lowStockCount > 0 && (
          <Link 
            to="/admin/inventory"
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{data.lowStockCount} Products below minimum threshold stock</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-auto text-rose-600" />
          </Link>
        )}
      </div>

      {/* ─── STAT CARDS ROW (REAL METRICS) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Collections</p>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0D47A1] flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-1">{formatMoney(data.totalRevenue)}</h3>
          <p className="text-xs font-semibold text-slate-500">
            Dues Pending: <span className="text-rose-600 font-bold">{formatMoney(data.outstandingDues)}</span>
          </p>
        </div>

        {/* Today's Delivered Volume */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Today Delivered Milk</p>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Milk className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-emerald-600 mb-1">{data.todayMilk || 0} L</h3>
          <p className="text-xs font-semibold text-slate-500">
            {data.delivered || 0} stops delivered today
          </p>
        </div>

        {/* Pending Deliveries */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Deliveries</p>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-blue-600 mb-1">{data.pendingDeliveries || 0}</h3>
          <p className="text-xs font-semibold text-slate-500">
            {data.skippedToday || 0} customer skips today
          </p>
        </div>

        {/* Active Customers */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Customers</p>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-1">{data.customers || 0}</h3>
          <p className="text-xs font-semibold text-slate-500">
            {data.deliveryBoys || 0} active delivery partners
          </p>
        </div>
      </div>

      {/* ─── CHARTS & TOP PRODUCTS ROW ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Trend / Volume */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Collections (Past 7 Days)</h3>
              <p className="text-xs text-slate-400">Daily collections ledger verified</p>
            </div>
            <Link to="/admin/monthly-billing" className="text-xs font-bold text-blue-600 hover:underline">
              View Billing
            </Link>
          </div>

          {weeklyData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D47A1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0D47A1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip 
                    formatter={(val) => [formatMoney(val), 'Collected']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#0D47A1" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-4">
              <IndianRupee className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-600">No collections recorded in the past 7 days</p>
              <p className="text-[11px] text-slate-400">Payments will automatically populate as bills are collected.</p>
            </div>
          )}
        </div>

        {/* Today's Delivery Status Donut */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Today's Delivery Status</h3>
            <p className="text-xs text-slate-400">Live operational progress</p>
          </div>

          {donutData.length > 0 ? (
            <div className="h-48 w-full my-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-slate-400">
              No deliveries logged for today yet.
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600 font-medium">Delivered: {data.ordersByStatus?.DELIVERED || 0}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="text-slate-600 font-medium">Pending: {data.ordersByStatus?.PENDING || 0}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <span className="text-slate-600 font-medium">Skipped: {data.ordersByStatus?.SKIPPED || 0}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-slate-600 font-medium">Missed: {data.ordersByStatus?.MISSED || 0}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ─── REAL TOP PRODUCTS & RECENT DELIVERIES ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Products from delivery_items */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Top Products Delivered</h3>
              <p className="text-xs text-slate-400">Cumulative fulfilled volume</p>
            </div>
            <Link to="/admin/products" className="text-xs font-bold text-blue-600 hover:underline">
              Manage Catalog
            </Link>
          </div>

          <div className="space-y-3">
            {data.topProducts && data.topProducts.length > 0 ? (
              data.topProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs">
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{p.name}</h4>
                      <p className="text-[11px] text-slate-400">Unit: {p.unit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-800">{parseFloat(p.sold).toFixed(1)} {p.unit}</span>
                    <span className="block text-[10px] text-slate-400">Delivered</span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No products delivered yet" description="Delivered items will appear here." />
            )}
          </div>
        </div>

        {/* Recent Delivery Activity */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Recent Delivery Activity</h3>
              <p className="text-xs text-slate-400">Today's audit log stream</p>
            </div>
            <Link to="/admin/daily-logs" className="text-xs font-bold text-blue-600 hover:underline">
              Full Logs
            </Link>
          </div>

          <div className="space-y-3">
            {data.recentActivity && data.recentActivity.length > 0 ? (
              data.recentActivity.map((act, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      act.status === 'DELIVERED' ? 'bg-emerald-500' : 'bg-slate-400'
                    }`} />
                    <p className="text-xs font-bold text-slate-800 truncate">{act.text}</p>
                  </div>
                  <StatusBadge status={act.status} />
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No deliveries recorded yet today.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
