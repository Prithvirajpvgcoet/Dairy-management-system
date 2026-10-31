import React, { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle2, Lock, Loader2, Clock, AlertCircle } from 'lucide-react';
import api from '../../api/client';

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletHistory, setWalletHistory] = useState([]);
  const [showWalletHistory, setShowWalletHistory] = useState(false);


  useEffect(() => { fetchBills(); }, []);

  const fetchBills = async () => {
    try {
      const [billsRes, walletRes] = await Promise.all([
        api.get('/customer/bills'),
        api.get('/customer/wallet').catch(() => null)
      ]);
      if (walletRes && walletRes.data) {
        setWalletBalance(walletRes.data.balance || 0);
        setWalletHistory(walletRes.data.transactions || []);
      }
      if (res) setBills(billsRes.data);
    } catch (error) {
      console.error('Failed to fetch bills', error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('default', { month: 'long' });
  };

  
  const handleDownloadPDF = async (bill) => {
    try {
      // Create a temporary link to download the file directly from backend API
      const token = localStorage.getItem('token');
      // Fetch as blob
      const response = await fetch(`/api/customer/bills/${bill.id}/pdf`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to download PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Dairy_Bill_${bill.month}_${bill.year}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Could not download PDF: ' + err.message);
    }
  };



  if (loading) {
    return <div className="flex-1 flex justify-center items-center h-full min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-[#1551b5]" /></div>;
  }

  // Only show FINAL and PAID bills to customer — DRAFT is invisible
  const visibleBills = bills.filter(b => b.status === 'FINAL' || b.status === 'PAID');
  const hasDrafts = bills.some(b => b.status === 'DRAFT');

  return (
    <div className="md:p-2 bg-slate-50 min-h-full">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        
        
        {/* Wallet Section */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-6 shadow-lg text-white mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">Advance Wallet Balance</p>
              <h3 className="text-3xl font-extrabold flex items-center gap-2">
                ₹{parseFloat(walletBalance).toFixed(2)}
              </h3>
              <p className="text-emerald-100 text-xs mt-1">Automatically deducted from your monthly bills</p>
            </div>
            <button 
              onClick={() => setShowWalletHistory(!showWalletHistory)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
            >
              {showWalletHistory ? 'Hide History' : 'View History'}
            </button>
          </div>
          
          {showWalletHistory && (
            <div className="mt-6 bg-white/10 rounded-2xl p-4 space-y-3">
              {walletHistory.length === 0 ? (
                <p className="text-sm text-emerald-100 text-center">No wallet transactions yet</p>
              ) : (
                walletHistory.slice(0, 5).map(txn => (
                  <div key={txn.id} className="flex justify-between items-center border-b border-white/10 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-bold">{txn.description}</p>
                      <p className="text-xs text-emerald-100">{new Date(txn.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${txn.type === 'CREDIT' ? 'text-green-300' : 'text-red-300'}`}>
                        {txn.type === 'CREDIT' ? '+' : '-'}₹{parseFloat(txn.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-emerald-100">Bal: ₹{parseFloat(txn.balance_after).toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Header */}
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mr-4">
            <FileText className="w-6 h-6 text-[#1551b5]" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-800">My Bills</h2>
            <p className="text-sm text-gray-500 font-medium">Monthly invoices finalized by the dairy admin.</p>
          </div>
        </div>

        {/* Pending draft notice */}
        {hasDrafts && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-amber-800">Bill Under Review</p>
              <p className="text-sm text-amber-700 mt-1">
                Your latest monthly bill is currently being reviewed and verified by the admin. It will appear here once approved.
              </p>
            </div>
          </div>
        )}

        {/* Bills list */}
        {visibleBills.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium text-lg mb-2">No Bills Yet</p>
            <p className="text-sm text-gray-400">Your finalized monthly bills will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {visibleBills.map(bill => (
              <div key={bill.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                
                {/* Top accent */}
                <div className={`h-1.5 w-full ${bill.status === 'PAID' ? 'bg-green-500' : 'bg-[#0D47A1]'}`} />
                
                <div className="p-6">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900">
                        {getMonthName(bill.month)} {bill.year}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium mt-1">
                        Generated: {bill.finalized_at ? new Date(bill.finalized_at).toLocaleDateString('en-GB') : new Date(bill.generated_date).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    <span className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-wider flex items-center gap-1.5 ${
                      bill.status === 'PAID' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-50 text-blue-700'
                    }`}>
                      {bill.status === 'PAID' ? <CheckCircle2 className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {bill.status}
                    </span>
                  </div>

                  {/* Stats Row */}
                  {(bill.delivered_days !== undefined) && (
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      <div className="bg-green-50 rounded-xl p-3 text-center">
                        <p className="text-xl font-extrabold text-green-700">{bill.delivered_days || 0}</p>
                        <p className="text-[10px] font-bold text-green-600 mt-1">Delivered</p>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-3 text-center">
                        <p className="text-xl font-extrabold text-amber-700">{bill.skipped_days || 0}</p>
                        <p className="text-[10px] font-bold text-amber-600 mt-1">Skipped</p>
                      </div>
                      <div className="bg-red-50 rounded-xl p-3 text-center">
                        <p className="text-xl font-extrabold text-red-700">{bill.missed_days || 0}</p>
                        <p className="text-[10px] font-bold text-red-600 mt-1">Missed</p>
                      </div>
                    </div>
                  )}

                  {/* Amount breakdown */}
                  <div className="border-t border-gray-100 pt-4 space-y-2">
                    {parseFloat(bill.subscription_charge || 0) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Subscription</span>
                        <span className="font-bold text-gray-700">₹{parseFloat(bill.subscription_charge).toFixed(2)}</span>
                      </div>
                    )}
                    {parseFloat(bill.addon_charge || 0) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 font-medium">Add-ons</span>
                        <span className="font-bold text-gray-700">₹{parseFloat(bill.addon_charge).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-base font-extrabold text-gray-900">Total</span>
                      <span className="text-2xl font-extrabold text-[#0D47A1]">
                        ₹{parseFloat(bill.total_amount || bill.amount).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={() => handleDownloadPDF(bill)}
                    className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-slate-50 hover:border-blue-200 hover:text-[#0D47A1] transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bills;
