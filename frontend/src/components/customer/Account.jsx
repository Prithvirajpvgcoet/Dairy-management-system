import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, LogOut, Loader2, Lock, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/client';

export default function Account() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    fetchAccount();
  }, []);

  const fetchAccount = async () => {
    try {
      const res = await api.get('/customer/account');
      if (res?.data) {
        setAccount(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch account", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters long');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }

    setChangingPass(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setChangingPass(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading || !account) {
    return (
      <div className="flex-1 flex justify-center items-center h-full min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1551b5]" />
      </div>
    );
  }

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'CU';

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-full font-['Poppins']">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mr-4">
            <User className="w-5 h-5 text-[#1551b5]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">My Account Profile</h2>
            <p className="text-xs text-gray-500">Manage account credentials and contact info</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0D47A1] to-[#1565C0] h-20"></div>
          <div className="px-6 pb-6 relative">
            <div className="w-16 h-16 rounded-2xl bg-white border-2 border-white shadow-md flex items-center justify-center text-[#0D47A1] text-xl font-black absolute -top-8">
              {getInitials(account.name)}
            </div>
            
            <div className="pt-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{account.name}</h3>
                  <p className="text-xs text-gray-400">Customer Account</p>
                </div>
                {account.subscriptionStatus && (
                  <span className={`px-3 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider border ${
                    account.subscriptionStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                    account.subscriptionStatus === 'PENDING PAYMENT' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                    'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>
                    {account.subscriptionStatus}
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="flex items-start">
                  <Mail className="w-4 h-4 text-gray-400 mr-2.5 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Email</p>
                    <p className="text-xs font-semibold text-gray-800 truncate">{account.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="w-4 h-4 text-gray-400 mr-2.5 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Phone</p>
                    <p className="text-xs font-semibold text-gray-800 truncate">{account.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start sm:col-span-2">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2.5 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Delivery Address</p>
                    <p className="text-xs font-semibold text-gray-800">{account.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-gray-800">Security & Password</h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter current password"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Min 6 characters"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Re-enter new password"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={changingPass}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2"
              >
                {changingPass && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Update Password
              </button>
            </div>
          </form>
        </div>
        
        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-full bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold py-3 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center text-sm"
        >
          <LogOut className="w-4 h-4 mr-2" /> Log Out
        </button>
      </div>
    </div>
  );
}
