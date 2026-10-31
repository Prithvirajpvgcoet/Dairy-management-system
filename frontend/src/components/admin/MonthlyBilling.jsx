import React, { useState, useEffect } from 'react';
import { FileText, Loader2, CheckCircle2, Clock, ChevronRight, BarChart3, Users, AlertCircle, Download, Lock } from 'lucide-react';
import api from '../../api/client';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const MonthlyBilling = () => {
  const now = new Date();
  const [monthStr, setMonthStr] = useState(now.toISOString().slice(0, 7));
  const [overview, setOverview] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [ledger, setLedger] = useState(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [finalizing, setFinalizing] = useState(null);

  useEffect(() => { fetchOverview(); }, [monthStr]);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const [year, monthNum] = monthStr.split('-');
      const res = await api.get(`/admin/billing/overview?month=${monthNum}&year=${year}`);
      if (res) {
        setOverview(res.data.summary);
        setBills(res.data.bills || []);
      }
    } catch (err) {
      // Fallback: try old endpoint
      try {
        const [year, monthNum] = monthStr.split('-');
        const res = await api.get(`/admin/monthly-billing?month=${MONTHS[parseInt(monthNum)-1]}&year=${year}`);
        if (res) {
          setBills(res.data.map(b => ({ ...b, customer_name: b.customer_name || b.customer })));
          setOverview(null);
        }
      } catch (e) { console.error(e); }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const [year, monthNum] = monthStr.split('-');
      await api.post(`/admin/billing/generate?month=${monthNum}&year=${year}`);
      await fetchOverview();
      alert(`✅ Draft bills generated for ${MONTHS[parseInt(monthNum)-1]} ${year}`);
    } catch (err) {
      // Fallback to old endpoint
      try {
        const [year, monthNum] = monthStr.split('-');
        await api.post(`/admin/generate-bills?month=${MONTHS[parseInt(monthNum)-1]}&year=${year}`);
        await fetchOverview();
        alert('Bills generated!');
      } catch (e) { alert('Failed: ' + (e.response?.data?.message || e.message)); }
    } finally {
      setGenerating(false);
    }
  };

  const handleViewLedger = async (bill) => {
    setSelectedBill(bill);
    setLedgerLoading(true);
    try {
      const [year, monthNum] = monthStr.split('-');
      const res = await api.get(`/admin/billing/ledger/${bill.customer_id}?month=${monthNum}&year=${year}`);
      if (res) setLedger(res.data);
    } catch (err) {
      setLedger(null);
    } finally {
      setLedgerLoading(false);
    }
  };

  const handleFinalize = async (bill) => {
    if (!window.confirm(`Finalize bill for ${bill.customer_name}? This cannot be undone.`)) return;
    setFinalizing(bill.id);
    try {
      await api.post(`/admin/billing/finalize/${bill.id}`);
      await fetchOverview();
      if (selectedBill?.id === bill.id) setSelectedBill({ ...selectedBill, status: 'FINAL' });
    } catch (err) {
      alert('Failed to finalize: ' + (err.response?.data?.message || err.message));
    } finally {
      setFinalizing(null);
    }
  };

  const handleDownloadPDF = (bill, ledgerData) => {
    const doc = new jsPDF();
    const [year, monthNum] = monthStr.split('-');
    const monthName = MONTHS[parseInt(monthNum) - 1];

    doc.setFontSize(20);
    doc.setTextColor(13, 71, 161);
    doc.text('अमराळे Dairy — Monthly Invoice', 20, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${monthName} ${year}  |  Customer: ${bill.customer_name}  |  Bill #${bill.id}`, 20, 32);
    doc.line(20, 37, 190, 37);

    if (ledgerData?.ledger?.length) {
      const rows = ledgerData.ledger.map(r => [
        r.record_date?.slice(0, 10) || '—',
        r.subscription_qty || 0,
        r.addon_qty || 0,
        r.actual_qty || 0,
        r.delivery_status || '—',
        `₹${parseFloat(r.billable_amount || 0).toFixed(2)}`
      ]);
      doc.autoTable({
        startY: 42,
        head: [['Date', 'Sub Qty', 'Add-on', 'Actual', 'Status', 'Billable']],
        body: rows,
        headStyles: { fillColor: [13, 71, 161] },
        styles: { fontSize: 9 },
      });
    }

    const finalY = doc.lastAutoTable?.finalY || 80;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Subscription: ₹${parseFloat(bill.subscription_charge || bill.amount || 0).toFixed(2)}`, 20, finalY + 12);
    doc.text(`Add-ons:      ₹${parseFloat(bill.addon_charge || 0).toFixed(2)}`, 20, finalY + 22);
    doc.setFontSize(14);
    doc.setTextColor(13, 71, 161);
    doc.text(`TOTAL: ₹${parseFloat(bill.total_amount || bill.amount).toFixed(2)}`, 20, finalY + 36);
    doc.save(`Amrale-${bill.customer_name}-${monthName}-${year}.pdf`);
  };

  const [year, monthNum] = monthStr.split('-');
  const monthName = MONTHS[parseInt(monthNum) - 1];

  const statusBadge = (status) => {
    const map = {
      DRAFT: 'bg-amber-100 text-amber-700',
      FINAL: 'bg-blue-100 text-blue-700',
      PAID: 'bg-green-100 text-green-700',
      PENDING: 'bg-amber-100 text-amber-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-full">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-800">Monthly Billing</h2>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Generate draft bills → review ledger → finalize for customers.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="month"
              value={monthStr}
              onChange={e => setMonthStr(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 bg-white shadow-sm focus:ring-2 focus:ring-blue-300 outline-none"
            />
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-[#0D47A1] text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md hover:bg-blue-800 transition-colors disabled:opacity-70"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
              Generate Drafts
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {overview && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Bills', value: overview.total, color: 'text-gray-800', bg: 'bg-white' },
              { label: 'Draft (Unreviewed)', value: overview.draft, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Finalized', value: overview.final, color: 'text-blue-700', bg: 'bg-blue-50' },
              { label: 'Paid', value: overview.paid, color: 'text-green-700', bg: 'bg-green-50' },
            ].map((s, i) => (
              <div key={i} className={`${s.bg} rounded-2xl p-5 shadow-sm border border-gray-100`}>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{s.label}</p>
                <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Billed Amount</p>
              <p className="text-3xl font-extrabold text-gray-800">₹{parseFloat(overview.totalAmount || 0).toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amount Collected (Paid)</p>
              <p className="text-3xl font-extrabold text-green-600">₹{parseFloat(overview.paidAmount || 0).toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Two-panel layout when ledger is open */}
        <div className={`flex gap-6 ${selectedBill ? 'flex-col xl:flex-row' : ''}`}>

          {/* Bills Table */}
          <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${selectedBill ? 'xl:w-1/2' : 'w-full'}`}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-gray-800">
                {monthName} {year} — Bills
              </h3>
              {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
            </div>

            {bills.length === 0 && !loading ? (
              <div className="p-12 text-center">
                <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No bills yet. Click "Generate Drafts" to start.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                      <th className="px-5 py-3 text-left">Customer</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                      <th className="px-5 py-3 text-center">Status</th>
                      <th className="px-5 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bills.map(bill => (
                      <tr key={bill.id} className={`hover:bg-slate-50 transition-colors ${selectedBill?.id === bill.id ? 'bg-blue-50' : ''}`}>
                        <td className="px-5 py-4">
                          <p className="font-bold text-gray-800">{bill.customer_name}</p>
                          <p className="text-xs text-gray-400">{bill.phone}</p>
                        </td>
                        <td className="px-5 py-4 text-right font-extrabold text-gray-800">
                          ₹{parseFloat(bill.total_amount || bill.amount || 0).toFixed(2)}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase ${statusBadge(bill.status)}`}>
                            {bill.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewLedger(bill)}
                              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              Ledger <ChevronRight className="w-3 h-3" />
                            </button>
                            {bill.status === 'DRAFT' && (
                              <button
                                onClick={() => handleFinalize(bill)}
                                disabled={finalizing === bill.id}
                                className="text-xs font-bold text-white bg-[#0D47A1] px-3 py-1.5 rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-1 disabled:opacity-70"
                              >
                                {finalizing === bill.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lock className="w-3 h-3" />}
                                Finalize
                              </button>
                            )}
                            {(bill.status === 'FINAL' || bill.status === 'PAID') && (
                              <button
                                onClick={() => handleDownloadPDF(bill, ledger)}
                                className="text-xs font-bold text-gray-600 border border-gray-200 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1"
                              >
                                <Download className="w-3 h-3" /> PDF
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Ledger Panel */}
          {selectedBill && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden xl:w-1/2">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-gray-800">Daily Ledger — {selectedBill.customer_name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{monthName} {year}</p>
                </div>
                <button onClick={() => setSelectedBill(null)} className="text-gray-400 hover:text-gray-700 text-xl font-bold">×</button>
              </div>

              {ledgerLoading ? (
                <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
              ) : ledger?.ledger ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-gray-400 font-bold uppercase tracking-wider">
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-3 py-3 text-right">Sub</th>
                          <th className="px-3 py-3 text-right">Add-on</th>
                          <th className="px-3 py-3 text-right">Actual</th>
                          <th className="px-3 py-3 text-center">Status</th>
                          <th className="px-3 py-3 text-right">Billable</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {ledger.ledger.map((row, i) => (
                          <tr key={i} className={`${!row.is_billable ? 'opacity-60' : ''} hover:bg-slate-50`}>
                            <td className="px-4 py-2.5 font-bold text-gray-700">{row.record_date?.slice(0, 10)}</td>
                            <td className="px-3 py-2.5 text-right text-gray-600">{row.subscription_qty || 0}</td>
                            <td className="px-3 py-2.5 text-right text-blue-600 font-bold">{parseFloat(row.addon_qty || 0) > 0 ? `+${row.addon_qty}` : '—'}</td>
                            <td className="px-3 py-2.5 text-right font-bold text-gray-800">{row.actual_qty || 0}</td>
                            <td className="px-3 py-2.5 text-center">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                                row.delivery_status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                row.delivery_status === 'CUSTOMER_SKIPPED' ? 'bg-amber-100 text-amber-700' :
                                row.delivery_status === 'ADDON' ? 'bg-blue-100 text-blue-700' :
                                'bg-red-100 text-red-700'
                              }`}>{row.delivery_status}</span>
                            </td>
                            <td className="px-3 py-2.5 text-right font-extrabold text-gray-800">
                              ₹{parseFloat(row.billable_amount || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Ledger footer */}
                  <div className="p-5 border-t border-gray-100 bg-slate-50">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500 font-medium">Subscription Total</span>
                      <span className="font-bold">₹{parseFloat(selectedBill.subscription_charge || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-gray-500 font-medium">Add-on Total</span>
                      <span className="font-bold">₹{parseFloat(selectedBill.addon_charge || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-extrabold text-[#0D47A1] pt-3 border-t border-gray-200">
                      <span>Grand Total</span>
                      <span>₹{parseFloat(selectedBill.total_amount || selectedBill.amount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No detailed ledger available. Generate bills first.
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MonthlyBilling;
