import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, XCircle, Clock, FileDown, Search, Loader2 } from 'lucide-react';
import api from '../../api/client';


const DailyLogs = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await api.get(`/admin/daily-logs?date=${date}`);
      if (res) {
        const data = res.data;
        // Map db structure to UI structure
        const mappedLogs = data.map(log => ({
          id: log.id,
          customer: log.customer_name,
          boy: log.delivery_boy_name,
          req: log.aggregated_requirements || 'No active requirement',
          status: log.status === 'NOT_AVAILABLE' ? 'Missed' : (log.status.charAt(0).toUpperCase() + log.status.slice(1).toLowerCase()),
          time: 'N/A' // Time could be extracted from created_at if we had it
        }));
        setLogs(mappedLogs);
      }
    } catch (error) {
      console.error("Error fetching daily logs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const intervalId = setInterval(fetchLogs, 45000);
    return () => clearInterval(intervalId);
  }, [date]);



  const filteredLogs = logs.filter(log => 
    log.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.boy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-full">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Daily Delivery Logs</h1>
          <p className="text-sm text-gray-500 mt-1">Track and verify daily milk deliveries across all routes.</p>
        </div>
        
        <div className="flex space-x-3">
          <div className="relative">
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1551b5] font-semibold text-gray-700"
            />
            <CalendarIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-gray-50 transition flex items-center text-sm">
            <FileDown className="w-4 h-4 mr-2" /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-semibold mb-1">Total Deliveries</p>
            <h3 className="text-xl font-bold text-gray-800">{loading ? '-' : logs.length}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1551b5]">
             <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-semibold mb-1">Delivered</p>
            <h3 className="text-xl font-bold text-green-600">{loading ? '-' : logs.filter(l => l.status === 'Delivered').length}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
             <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-semibold mb-1">Pending</p>
            <h3 className="text-xl font-bold text-orange-500">{loading ? '-' : logs.filter(l => l.status === 'Pending').length}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
             <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-semibold mb-1">Missed</p>
            <h3 className="text-xl font-bold text-red-500">{loading ? '-' : logs.filter(l => l.status === 'Missed').length}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
             <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search by customer or boy..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1551b5] focus:border-transparent w-72"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="overflow-x-auto relative min-h-[200px]">
          {loading ? (
            <div className="absolute inset-0 flex justify-center items-center bg-white/50"><Loader2 className="w-8 h-8 animate-spin text-[#1551b5]" /></div>
          ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-4 font-semibold uppercase">Customer</th>
                <th className="px-6 py-4 font-semibold uppercase">Requirement</th>
                <th className="px-6 py-4 font-semibold uppercase">Delivery Boy</th>
                <th className="px-6 py-4 font-semibold uppercase">Time</th>
                <th className="px-6 py-4 font-semibold uppercase">Status</th>
                <th className="px-6 py-4 font-semibold uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800">{log.customer}</td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{log.req}</td>
                  <td className="px-6 py-4 text-gray-600">{log.boy}</td>
                  <td className="px-6 py-4 text-gray-500">{log.time}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      log.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      log.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[#1551b5] hover:underline font-semibold text-xs">Edit</button>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No logs found for this date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>

    </div>
  );
};

export default DailyLogs;
