import React from 'react';
import { 
    Award, 
    TrendingUp, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    IndianRupee, 
    Milk,
    Calendar
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function DeliveryEarnings({ performanceData }) {
    const stats = performanceData?.stats || {};
    const daily = performanceData?.daily || [];

    const chartData = daily.map(d => ({
        date: typeof d.date === 'string' ? d.date.slice(5) : d.date,
        deliveries: parseInt(d.delivered || 0, 10),
        liters: parseFloat(d.liters || 0)
    }));

    return (
        <div className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Completion Rate</span>
                        <Award className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-black text-slate-800">{stats.on_time_rate || '100.0'}%</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{stats.delivered || 0} of {stats.total_assigned || 0} completed</p>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Liters Delivered</span>
                        <Milk className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-black text-blue-600">{stats.total_liters || '0.0'} L</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">This Month's Volume</p>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Earnings</span>
                        <IndianRupee className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-black text-emerald-600">₹{stats.estimated_earnings || '0.00'}</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Plan: {stats.salary_type || 'Standard'}</p>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">Skipped / Missed</span>
                        <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-2xl font-black text-slate-700">{stats.skipped || 0} / {stats.missed || 0}</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">Exceptions Handled</p>
                </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Past 7 Days Delivery Volume</h3>
                        <p className="text-xs text-slate-400">Total liters delivered per day</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span> Liters
                    </div>
                </div>

                {chartData.length > 0 ? (
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                                <YAxis tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                                <Tooltip
                                    formatter={(value) => [`${value} Liters`, 'Delivered']}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="liters" fill="#0D47A1" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-48 flex items-center justify-center text-sm text-slate-400">
                        No delivery history recorded in the past 7 days.
                    </div>
                )}
            </div>
        </div>
    );
}
