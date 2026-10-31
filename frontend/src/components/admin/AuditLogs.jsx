import React, { useState, useEffect } from 'react';
import { Activity, Search, ShieldAlert, History } from 'lucide-react';
import api from '../../api/client';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/admin/audit-logs');
      setLogs(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  const filteredLogs = logs.filter(l => 
    (l.action && l.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (l.user_name && l.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (l.notes && l.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-indigo-600" /> Security & Audit Logs
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Track all sensitive actions across the system</p>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search logs..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 w-64 text-sm font-medium"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
              <th className="p-4 font-bold rounded-tl-xl w-1/5">Timestamp</th>
              <th className="p-4 font-bold w-1/6">User</th>
              <th className="p-4 font-bold w-1/5">Action</th>
              <th className="p-4 font-bold">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4 text-sm font-bold text-gray-600 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="p-4">
                  <div className="font-bold text-gray-900">{log.user_name || 'System'}</div>
                  <div className="text-[10px] font-bold text-indigo-600 uppercase">{log.user_role}</div>
                </td>
                <td className="p-4 text-sm font-bold text-gray-800">
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                    {log.action}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  <div className="font-medium">{log.notes}</div>
                  {(log.old_value || log.new_value) && (
                    <div className="mt-1 flex gap-2 text-[10px] font-mono text-gray-400">
                      {log.old_value && <span>Old: {JSON.stringify(log.old_value)}</span>}
                      {log.new_value && <span>New: {JSON.stringify(log.new_value)}</span>}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;
