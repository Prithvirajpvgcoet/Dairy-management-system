import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Mail, Phone, Clock, Filter, 
  CheckCircle2, AlertCircle, RefreshCw, Search 
} from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import toast from 'react-hot-toast';

export default function SupportMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterKind, setFilterKind] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMessages();
  }, [filterKind, filterStatus]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterKind !== 'ALL') params.kind = filterKind;
      if (filterStatus !== 'ALL') params.status = filterStatus;

      const res = await api.get('/admin/messages', { params });
      setMessages(res.data || []);
    } catch (err) {
      toast.error('Failed to load support messages');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/admin/messages/${id}/status`, { status: newStatus });
      toast.success(`Message marked as ${newStatus}`);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filtered = messages.filter(m => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.phone?.includes(q) ||
      m.message?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* ── Top Bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Support & Public Inquiries</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Incoming website inquiries, customer feedbacks, and consumer grievances.
          </p>
        </div>
        <button
          onClick={fetchMessages}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone, message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0D47A1] focus:outline-none"
          />
        </div>

        {/* Kind and Status Dropdowns */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={filterKind}
            onChange={(e) => setFilterKind(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="CONTACT">Inquiries (CONTACT)</option>
            <option value="FEEDBACK">Feedback</option>
            <option value="GRIEVANCE">Grievances</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* ── Messages List ── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 rounded-2xl bg-white border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No messages found"
          description="There are currently no inquiries or feedback matching your filter criteria."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((msg) => (
            <div
              key={msg.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow transition-shadow flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    msg.kind === 'GRIEVANCE' 
                      ? 'bg-red-100 text-red-800' 
                      : msg.kind === 'FEEDBACK'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {msg.kind}
                  </span>
                  <StatusBadge status={msg.status} />
                  <span className="text-xs text-slate-400">
                    {new Date(msg.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">{msg.name}</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {msg.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {msg.email}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed mt-2">
                  "{msg.message}"
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex md:flex-col items-center gap-2 shrink-0 pt-2 md:pt-0">
                {msg.status !== 'IN_PROGRESS' && msg.status !== 'CLOSED' && (
                  <button
                    onClick={() => handleUpdateStatus(msg.id, 'IN_PROGRESS')}
                    className="w-full px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors"
                  >
                    Mark In Progress
                  </button>
                )}
                {msg.status !== 'CLOSED' && (
                  <button
                    onClick={() => handleUpdateStatus(msg.id, 'CLOSED')}
                    className="w-full px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors"
                  >
                    Mark Closed
                  </button>
                )}
                {msg.status === 'CLOSED' && (
                  <button
                    onClick={() => handleUpdateStatus(msg.id, 'IN_PROGRESS')}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    Reopen
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
