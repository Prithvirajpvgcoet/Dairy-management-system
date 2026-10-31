import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Users, Truck, Package, FileText, 
  Bell, Search, UserPlus, PackagePlus, Loader2, ArrowUpRight, 
  Clock, Activity, Zap, CheckCircle2, XCircle
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend, AreaChart, Area 
} from 'recharts';
import { Link } from 'react-router-dom';
import api from '../../api/client';

const AdminDashboard = () => {
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D47A1]" />
      </div>
    );
  }

  // Format currency
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const donutData = [
    { name: 'Delivered', value: data.ordersByStatus?.DELIVERED || 0, color: '#22C55E' },
    { name: 'Pending', value: data.ordersByStatus?.PENDING || 0, color: '#F97316' },
    { name: 'Cancelled', value: data.ordersByStatus?.MISSED || 0, color: '#EF4444' },
  ].filter(d => d.value > 0);

  // Fallback for weekly revenue if empty
  const weeklyData = data.weeklyRevenue?.length > 0 ? data.weeklyRevenue : [
    { date: '18 May', revenue: 15000 },
    { date: '19 May', revenue: 18000 },
    { date: '20 May', revenue: 16000 },
    { date: '21 May', revenue: 22000 },
    { date: '22 May', revenue: 20000 },
    { date: '23 May', revenue: 26000 },
    { date: '24 May', revenue: 25000 },
  ];

  // Dummy monthly sales for Bar chart
  const monthlySales = [
    { week: 'Week 1', sales: 120000 },
    { week: 'Week 2', sales: 150000 },
    { week: 'Week 3', sales: 130000 },
    { week: 'Week 4', sales: 180000 },
  ];

  return (
    <div className="space-y-6 font-['Poppins']">
      
      {/* ─── STAT CARDS ROW ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-gray-500">Total Revenue</p>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <span className="text-[#0D47A1] font-bold">₹</span>
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-gray-800 mb-2">{formatMoney(data.totalRevenue || 1245680)}</h3>
          <p className="text-xs font-semibold text-green-600 flex items-center bg-green-50 w-fit px-2 py-1 rounded-md">
            <TrendingUp className="w-3 h-3 mr-1" /> 15% <span className="text-gray-400 font-medium ml-1">vs yesterday</span>
          </p>
        </div>

        {/* Orders */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-gray-500">Total Orders</p>
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-gray-800 mb-2">{data.totalOrders || 1245}</h3>
          <p className="text-xs font-semibold text-green-600 flex items-center bg-green-50 w-fit px-2 py-1 rounded-md">
            <TrendingUp className="w-3 h-3 mr-1" /> 10% <span className="text-gray-400 font-medium ml-1">vs yesterday</span>
          </p>
        </div>

        {/* Pending */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-gray-500">Pending Deliveries</p>
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
              <Truck className="w-4 h-4 text-orange-500" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-gray-800 mb-2">{data.pendingDeliveries || 56}</h3>
          <p className="text-xs font-semibold text-red-500 flex items-center bg-red-50 w-fit px-2 py-1 rounded-md">
            <TrendingDown className="w-3 h-3 mr-1" /> 5% <span className="text-gray-400 font-medium ml-1">vs yesterday</span>
          </p>
        </div>

        {/* Customers */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-semibold text-gray-500">Active Customers</p>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-gray-800 mb-2">{data.customers || 2568}</h3>
          <p className="text-xs font-semibold text-green-600 flex items-center bg-green-50 w-fit px-2 py-1 rounded-md">
            <TrendingUp className="w-3 h-3 mr-1" /> 8% <span className="text-gray-400 font-medium ml-1">vs yesterday</span>
          </p>
        </div>
      </div>

      {/* ─── CHARTS & TOP PRODUCTS ROW ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Line Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-extrabold text-gray-800">Revenue Overview</h2>
            <select className="text-xs font-bold text-[#0D47A1] bg-blue-50 px-3 py-1.5 rounded-lg border-none outline-none cursor-pointer">
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D47A1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0D47A1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }} tickFormatter={v => `${v/1000}k`} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#0D47A1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold text-gray-800">Top Selling Products</h2>
            <Link to="/admin/products" className="text-xs font-bold text-[#0D47A1] hover:underline">View All</Link>
          </div>
          <div className="flex-1 overflow-auto">
            <div className="space-y-4">
              {(data.topProducts?.length > 0 ? data.topProducts : [
                { name: 'Cow Milk', sold: 12456, unit: 'L' },
                { name: 'Buffalo Milk', sold: 8250, unit: 'L' },
                { name: 'Curd', sold: 6125, unit: 'kg' },
                { name: 'Paneer', sold: 3450, unit: 'kg' },
                { name: 'Ghee', sold: 2350, unit: 'kg' },
              ]).map((p, i) => (
                <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl shadow-inner border border-blue-100">
                      {p.name.includes('Milk') ? '🥛' : p.name === 'Curd' ? '🥣' : p.name === 'Paneer' ? '🧀' : '🍯'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{p.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-[#0D47A1]">{p.sold.toLocaleString()}</p>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase">{p.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── ORDERS & DONUT ROW ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-gray-800">Recent Orders</h2>
            <Link to="/admin/monthly-billing" className="text-xs font-bold text-[#0D47A1] hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                  <th className="p-4 font-bold">Order ID</th>
                  <th className="p-4 font-bold">Customer</th>
                  <th className="p-4 font-bold">Amount</th>
                  <th className="p-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-gray-700 divide-y divide-gray-50">
                {(data.recentOrders?.length > 0 ? data.recentOrders : [
                  { id: 12345, customer_name: 'Rahul Sharma', amount: 104, status: 'PAID' },
                  { id: 12346, customer_name: 'Sneha Patil', amount: 165, status: 'PAID' },
                  { id: 12347, customer_name: 'Vijay Jadhav', amount: 110, status: 'PENDING' },
                ]).map((order, i) => (
                  <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 font-bold text-gray-900">ORD{order.id}</td>
                    <td className="p-4">{order.customer_name}</td>
                    <td className="p-4 font-bold">₹{order.amount}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                        order.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Orders by Status Donut */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2">
            <h2 className="text-base font-extrabold text-gray-800">Orders by Status</h2>
          </div>
          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-gray-800">{data.delivered || 835}</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase">Delivered</span>
            </div>
          </div>
          {/* Custom Legend */}
          <div className="w-full space-y-3 mt-4">
            {donutData.map((d, i) => {
              const total = donutData.reduce((a, b) => a + b.value, 0);
              const percent = total > 0 ? Math.round((d.value / total) * 100) : 0;
              return (
                <div key={i} className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                    <span className="text-gray-700">{d.name}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-gray-900">{d.value}</span>
                    <span className="text-gray-400 w-8 text-right">({percent}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── BOTTOM ROW: INVENTORY, PARTNERS, ACTIVITY ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Inventory Status */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-extrabold text-gray-800">Inventory Status</h2>
            <button className="text-xs font-bold text-[#0D47A1]">View All</button>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Cow Milk', val: 220, max: 250, unit: 'L', color: 'bg-green-500' },
              { name: 'Buffalo Milk', val: 180, max: 200, unit: 'L', color: 'bg-green-500' },
              { name: 'Curd', val: 150, max: 200, unit: 'kg', color: 'bg-[#0D47A1]' },
              { name: 'Paneer', val: 90, max: 100, unit: 'kg', color: 'bg-[#0D47A1]' },
              { name: 'Ghee', val: 70, max: 100, unit: 'kg', color: 'bg-orange-400' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-gray-700">{item.name}</span>
                  <span className="text-gray-900">{item.val} {item.unit}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-1.5 rounded-full ${item.color}`} style={{ width: `${(item.val/item.max)*100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Partners */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-extrabold text-gray-800">Delivery Partners</h2>
            <Link to="/admin/staff-management" className="text-xs font-bold text-[#0D47A1]">View All</Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-bold text-gray-700">Total Partners</span>
              </div>
              <span className="text-sm font-extrabold text-gray-900">{data.deliveryPartnerStats?.total || 36}</span>
            </div>
            <div className="flex items-center justify-between bg-green-50/50 p-3 rounded-xl border border-green-50">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm font-bold text-green-700">Active</span>
              </div>
              <span className="text-sm font-extrabold text-green-700">{data.deliveryPartnerStats?.active || 32}</span>
            </div>
            <div className="flex items-center justify-between bg-blue-50/50 p-3 rounded-xl border border-blue-50">
              <div className="flex items-center gap-3">
                <Truck className="w-4 h-4 text-[#0D47A1]" />
                <span className="text-sm font-bold text-[#0D47A1]">On Delivery</span>
              </div>
              <span className="text-sm font-extrabold text-[#0D47A1]">{data.deliveryPartnerStats?.onDelivery || 28}</span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <XCircle className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-bold text-gray-600">Offline</span>
              </div>
              <span className="text-sm font-extrabold text-gray-600">{data.deliveryPartnerStats?.offline || 4}</span>
            </div>
          </div>
        </div>

        {/* Sales Overview Bar Chart */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold text-gray-800">Sales Overview</h2>
            <span className="text-[10px] font-bold text-[#0D47A1] bg-blue-50 px-2 py-1 rounded-md">This Month ▾</span>
          </div>
          <div className="h-[200px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySales} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }} tickFormatter={v => `${v/1000}k`} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                <Bar dataKey="sales" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-base font-extrabold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Link to="/admin/products" className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-100 text-[#0D47A1] text-center group">
              <PackagePlus className="w-5 h-5 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold">Add Product</span>
            </Link>
            <Link to="/admin/customers" className="flex flex-col items-center justify-center p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors border border-indigo-100 text-indigo-700 text-center group">
              <UserPlus className="w-5 h-5 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold">Add Customer</span>
            </Link>
            <Link to="/admin/staff-management" className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-100 text-emerald-700 text-center group">
              <Truck className="w-5 h-5 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold">Add Partner</span>
            </Link>
            <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors border border-orange-100 text-orange-700 text-center group">
              <Bell className="w-5 h-5 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold">Notify All</span>
            </button>
          </div>

          <h2 className="text-base font-extrabold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {(data.recentActivity?.length > 0 ? data.recentActivity : [
              { text: 'New order ORD1235 placed by Rahul', created_at: new Date(Date.now() - 3*60000) },
              { text: 'Order ORD1234 delivered to Sneha', created_at: new Date(Date.now() - 15*60000) },
              { text: 'Payment received from Amit', created_at: new Date(Date.now() - 25*60000) },
            ]).slice(0,3).map((act, i) => (
              <div key={i} className="relative flex items-center justify-between">
                <div className="flex items-center gap-3 w-full">
                  <div className="w-4 h-4 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center z-10 shrink-0 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0D47A1]"></div>
                  </div>
                  <div className="flex-1 flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <p className="text-[11px] font-semibold text-gray-700 truncate mr-2">{act.text}</p>
                    <span className="text-[9px] font-bold text-gray-400 shrink-0">
                      {new Date(act.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
