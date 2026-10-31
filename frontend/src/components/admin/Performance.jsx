import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../../api/client';

const Performance = () => {
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      const res = await api.get('/admin/performance');
      setPerformance(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Partner Performance</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Delivery reliability over the last 30 days</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
              <th className="p-4 font-bold rounded-tl-xl w-1/4">Delivery Partner</th>
              <th className="p-4 font-bold text-center">Assigned</th>
              <th className="p-4 font-bold text-center text-green-600">Delivered</th>
              <th className="p-4 font-bold text-center text-red-600">Missed</th>
              <th className="p-4 font-bold text-center text-amber-600">Skipped</th>
              <th className="p-4 font-bold text-right rounded-tr-xl">On-Time Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {performance.map((p) => (
              <tr key={p.delivery_boy_id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4 font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                    {p.name.charAt(0)}
                  </div>
                  {p.name}
                </td>
                <td className="p-4 text-center font-medium text-gray-600">{p.total_assigned}</td>
                <td className="p-4 text-center font-bold text-green-600">{p.total_delivered}</td>
                <td className="p-4 text-center font-bold text-red-600">{p.total_missed}</td>
                <td className="p-4 text-center font-medium text-amber-600">{p.total_skipped}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className={`font-bold ${p.on_time_rate >= 95 ? 'text-green-600' : p.on_time_rate >= 85 ? 'text-amber-600' : 'text-red-600'}`}>
                      {p.on_time_rate || 0}%
                    </span>
                  </div>
                  <div className="w-24 h-1.5 bg-gray-100 rounded-full ml-auto mt-1 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${p.on_time_rate >= 95 ? 'bg-green-500' : p.on_time_rate >= 85 ? 'bg-amber-500' : 'bg-red-500'}`} 
                      style={{ width: `${p.on_time_rate || 0}%` }}
                    ></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Performance;
