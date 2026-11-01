import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Clock, Calendar, Check, ArrowRight } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import toast from 'react-hot-toast';

const SUB_TABS = ['Milk Plans', 'Curd & Yogurt', 'Paneer', 'Ghee', 'Custom Plan'];

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState('Milk Plans');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(tomorrowStr);
  const [deliverySlot, setDeliverySlot] = useState('5:30 AM - 7:00 AM');

  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const plans = [
    {
      id: 1,
      name: 'Starter Plan',
      tagline: 'Perfect for individuals',
      icon: '🥛',
      desc: '1 L Cow Milk Daily',
      price: 1500,
      is_popular: false
    },
    {
      id: 2,
      name: 'Standard Plan',
      tagline: 'Most Popular',
      icon: '🥛',
      desc: '2 L Cow Milk Daily',
      price: 2800,
      is_popular: true
    },
    {
      id: 3,
      name: 'Premium Plan',
      tagline: 'For large families',
      icon: '🥛',
      desc: '3 L Cow Milk Daily',
      price: 3900,
      is_popular: false
    },
    {
      id: 4,
      name: 'Custom Plan',
      tagline: 'Your choice, your way',
      icon: '📦',
      desc: 'Select products & quantity',
      price: null,
      is_custom: true
    }
  ];

  const handleChoosePlan = (plan) => {
    if (plan.is_custom) {
      if (!user) navigate('/login?next=/customer/requirement');
      else navigate('/customer/requirement');
      return;
    }

    if (!user) {
      navigate(`/login?next=/subscriptions?select=${plan.id}`);
      return;
    }

    if (user.role !== 'CUSTOMER') {
      toast.error('Only customers can activate milk subscriptions');
      return;
    }

    setSelectedPlan(plan);
    setConfirmModalOpen(true);
  };

  const handleConfirmSubscription = async () => {
    if (!selectedPlan) return;
    try {
      setSubmitting(true);
      const res = await api.post('/customer/subscribe-plan', {
        planId: selectedPlan.id,
        startDate,
        deliverySlot
      });
      toast.success(res.data.message || 'Subscription activated successfully!');
      setConfirmModalOpen(false);
      navigate('/customer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to activate subscription');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      {/* ── Page Header (Mockup exact) ── */}
      <div className="bg-white border-b border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-black text-[#0A2540] tracking-tight">
            Milk Subscription
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Fresh dairy, automatically delivered to your doorstep.
          </p>

          {/* 4 Checkpoint bullets */}
          <div className="flex items-center gap-6 flex-wrap mt-4 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#0B5ED7]" /> Flexible plans</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#0B5ED7]" /> Pause or modify anytime</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#0B5ED7]" /> Save more with subscriptions</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#0B5ED7]" /> Doorstep delivery</span>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto mt-8 pb-2 scrollbar-none">
            {SUB_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-[#0B5ED7] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4 Subscription Cards (Mockup exact) ── */}
      <div className="py-12 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-3xl p-6 border flex flex-col justify-between transition-all ${
                  plan.is_popular
                    ? 'border-2 border-[#0B5ED7] shadow-lg'
                    : 'border-slate-200 shadow-xs hover:shadow-md'
                }`}
              >
                {plan.is_popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#0B5ED7] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                    Most Popular
                  </div>
                )}

                <div className="text-center pt-2">
                  <h3 className="text-lg font-black text-slate-900">{plan.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{plan.tagline}</p>

                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B5ED7] flex items-center justify-center mx-auto my-5 text-xl font-bold">
                    {plan.icon}
                  </div>

                  <p className="text-xs font-bold text-slate-700">{plan.desc}</p>

                  {plan.price ? (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <span className="text-2xl font-black text-slate-900">₹{plan.price.toLocaleString()}</span>
                      <span className="text-xs text-slate-400 font-semibold"> / month</span>
                    </div>
                  ) : (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <span className="text-lg font-black text-slate-900">Custom Rate</span>
                      <p className="text-[10px] text-slate-400">Pay as delivered</p>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => handleChoosePlan(plan)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors shadow-xs ${
                      plan.is_popular
                        ? 'bg-[#0B5ED7] hover:bg-blue-700 text-white'
                        : 'bg-[#0B5ED7] hover:bg-blue-700 text-white'
                    }`}
                  >
                    {plan.is_custom ? 'Create Plan' : 'Choose Plan'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── How It Works (Mockup exact) ── */}
          <div className="mt-16 pt-12 border-t border-slate-200/80">
            <h3 className="text-xl font-black text-slate-900 text-left mb-8">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#0B5ED7] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Choose a Plan</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Select your preferred products and daily quantity.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#0B5ED7] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Set Your Address</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Tell us your delivery location and preferred morning time.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#0B5ED7] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Enjoy Daily Delivery</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Get fresh dairy products at your doorstep every morning.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Bottom Banner: Goodness, Delivered Daily ── */}
          <div className="mt-14 rounded-2xl bg-[#E8F3FD] border border-blue-200 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-black text-slate-900">Goodness, Delivered Daily.</h3>
              <p className="text-xs text-slate-600 mt-1">
                Start your subscription today and experience the difference.
              </p>
            </div>
            <button
              onClick={() => handleChoosePlan(plans[1])}
              className="px-6 py-3 rounded-xl bg-[#0B5ED7] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
            >
              Subscribe Now →
            </button>
          </div>

        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title={selectedPlan ? `Subscribe to ${selectedPlan.name}` : 'Confirm Subscription'}
      >
        {selectedPlan && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <h4 className="font-black text-slate-900">{selectedPlan.name}</h4>
              <p className="text-xs text-slate-600 mt-0.5">{selectedPlan.desc}</p>
              {selectedPlan.price && (
                <p className="text-sm font-black text-[#0B5ED7] mt-2">
                  ₹{selectedPlan.price.toLocaleString()} / month
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Start Date
              </label>
              <input
                type="date"
                min={tomorrowStr}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#0B5ED7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Delivery Window
              </label>
              <select
                value={deliverySlot}
                onChange={(e) => setDeliverySlot(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#0B5ED7] focus:outline-none"
              >
                <option value="5:30 AM - 7:00 AM">Early Morning (5:30 AM - 7:00 AM)</option>
                <option value="7:00 AM - 8:30 AM">Morning (7:00 AM - 8:30 AM)</option>
              </select>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmSubscription}
                className="px-5 py-2 rounded-xl bg-[#0B5ED7] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
              >
                {submitting ? 'Activating...' : 'Confirm Subscription'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </PublicLayout>
  );
}
