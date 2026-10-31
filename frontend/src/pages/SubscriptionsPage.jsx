import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, ChevronRight, Sparkles, Clock, Calendar, 
  MapPin, ShieldCheck, ArrowRight, HelpCircle, AlertCircle 
} from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import toast from 'react-hot-toast';

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modal form states
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(tomorrowStr);
  const [deliverySlot, setDeliverySlot] = useState('5:30 AM - 7:00 AM');

  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    Promise.all([
      api.get('/plans').catch(() => ({ data: [] })),
      api.get('/faqs').catch(() => ({ data: [] }))
    ]).then(([planRes, faqRes]) => {
      setPlans(planRes.data || []);
      setFaqs(faqRes.data || []);
      setLoading(false);

      // Auto-open modal if plan param in URL
      const planParam = searchParams.get('select') || searchParams.get('plan');
      if (planParam && planRes.data) {
        const found = planRes.data.find(p => p.id === parseInt(planParam));
        if (found) {
          handleChoosePlan(found);
        }
      }
    });
  }, [searchParams]);

  const handleChoosePlan = (plan) => {
    if (plan.is_custom) {
      if (!user) {
        navigate('/login?next=/customer/requirement');
      } else {
        navigate('/customer/requirement');
      }
      return;
    }

    if (!user) {
      // Direct visitor to login/signup with return redirect
      navigate(`/login?next=/subscriptions?select=${plan.id}`);
      return;
    }

    if (user.role !== 'CUSTOMER') {
      toast.error('Only customer accounts can activate daily subscriptions');
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

      if (!res.data.hasRoute) {
        toast((t) => (
          <span className="text-xs">
            📍 <b>Local Route Confirmation:</b> Our operations team will assign your morning delivery partner shortly.
          </span>
        ), { duration: 6000, icon: 'ℹ️' });
      }

      navigate('/customer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to activate subscription');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200 py-12 sm:py-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <span className="text-xs font-bold text-[#0D47A1] uppercase tracking-wider">
            Daily Doorstep Deliveries
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-2">
            Flexible Milk Subscriptions
          </h1>
          <p className="text-base text-slate-600 mt-3 leading-relaxed">
            Freshly milked, chilled to 4°C, and delivered to your doorstep every morning by 7:00 AM. 
            Pause or skip dates anytime with 1 tap. Month-end bills calculate strictly what was delivered.
          </p>
        </div>
      </div>

      {/* ── Plans Grid ── */}
      <div className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-3xl h-96 animate-pulse border border-slate-200"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all ${
                    plan.is_popular
                      ? 'border-2 border-[#0D47A1] bg-blue-50/40 shadow-xl scale-[1.02]'
                      : 'border border-slate-200 bg-white shadow-sm hover:shadow-md'
                  }`}
                >
                  {plan.is_popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#0D47A1] text-white text-xs font-bold uppercase tracking-wider shadow">
                      Most Popular in Pune
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-2 min-h-[36px] leading-relaxed">
                      {plan.tagline}
                    </p>

                    {/* Pricing Box */}
                    <div className="my-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                      {plan.is_custom ? (
                        <div>
                          <span className="text-xs font-bold text-blue-700 uppercase">Pay Per Item</span>
                          <p className="text-2xl font-black text-slate-900 mt-1">Flexible Rate</p>
                          <p className="text-[11px] text-slate-400 mt-1">Pick products & custom frequency</p>
                        </div>
                      ) : (
                        <div>
                          <span className="text-xs text-slate-500 font-medium">Estimated 30-Day Cost</span>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-3xl font-black text-slate-900">₹{plan.monthly_price}</span>
                            <span className="text-xs text-slate-500">/ month</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            (Billed strictly as delivered at ₹{(plan.daily_price || plan.monthly_price/30).toFixed(0)}/day)
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Items Checklist */}
                    <div className="space-y-2.5 mb-8">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Included Daily:</p>
                      {plan.items && plan.items.length > 0 ? (
                        plan.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{parseFloat(item.quantity_per_day)} x {item.product_name} ({item.unit})</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Any combination of milk, curd, paneer & ghee</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Doorstep delivery before 7:00 AM</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Pause or skip days with 1 tap</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleChoosePlan(plan)}
                    className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm ${
                      plan.is_popular
                        ? 'bg-[#0D47A1] hover:bg-blue-800 text-white shadow-md'
                        : plan.is_custom
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {plan.is_custom ? 'Customize Daily Plan' : `Choose ${plan.name}`}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── How It Works ── */}
      <div className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <span className="text-xs font-bold text-[#0D47A1] uppercase tracking-wider">Subscription Guarantee</span>
          <h2 className="text-3xl font-black text-slate-900 mt-1">Zero Lock-In • Pay Per Delivery</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 text-left">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <Clock className="w-6 h-6 text-[#0D47A1] mb-3" />
              <h4 className="font-bold text-slate-900">Pause Up to 10 PM</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Traveling or have leftover milk? Tap "Skip" on your customer app by 10 PM and your delivery boy is notified instantly.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <Calendar className="w-6 h-6 text-[#0D47A1] mb-3" />
              <h4 className="font-bold text-slate-900">Exact Paisa Month-End Bill</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Bills are generated on the 1st of every month reflecting actual delivery checkmarks. No prepaid locks or hidden charges.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <ShieldCheck className="w-6 h-6 text-[#0D47A1] mb-3" />
              <h4 className="font-bold text-slate-900">Dedicated Route Partner</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                The same local delivery partner services your neighborhood daily for seamless morning familiarity and care.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── FAQ Preview ── */}
      <div className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-2xl font-black text-slate-900 text-center mb-8">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {faqs.slice(0, 4).map((faq) => (
              <div key={faq.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#0D47A1] shrink-0" />
                  {faq.question}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 pl-6 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/contact?tab=faq" className="text-xs sm:text-sm font-bold text-[#0D47A1] hover:underline">
              View all FAQs on Contact Page →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Subscription Confirmation Modal ── */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title={selectedPlan ? `Subscribe to ${selectedPlan.name}` : 'Confirm Subscription'}
      >
        {selectedPlan && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-xs text-blue-800 font-bold uppercase tracking-wider">Plan Summary</p>
              <h4 className="text-lg font-black text-slate-900 mt-0.5">{selectedPlan.name}</h4>
              <p className="text-xs text-slate-600 mt-1">{selectedPlan.tagline}</p>
              
              <div className="mt-3 pt-3 border-t border-blue-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-600">Daily Products:</span>
                <span className="font-bold text-slate-900">
                  {selectedPlan.items?.map(i => `${parseFloat(i.quantity_per_day)}x ${i.product_name}`).join(', ')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-slate-600">Estimated 30-Day Cost:</span>
                <span className="font-black text-[#0D47A1] text-sm">₹{selectedPlan.monthly_price}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Subscription Start Date
              </label>
              <input
                type="date"
                min={tomorrowStr}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#0D47A1] focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Deliveries can start tomorrow morning or any future date.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Preferred Morning Delivery Window
              </label>
              <select
                value={deliverySlot}
                onChange={(e) => setDeliverySlot(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#0D47A1] focus:outline-none"
              >
                <option value="5:30 AM - 7:00 AM">Early Morning (5:30 AM - 7:00 AM) [Recommended]</option>
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
                className="px-5 py-2 rounded-xl bg-[#0D47A1] hover:bg-blue-800 text-white text-xs font-bold shadow-md transition-colors disabled:opacity-50"
              >
                {submitting ? 'Activating...' : 'Confirm & Activate'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </PublicLayout>
  );
}
