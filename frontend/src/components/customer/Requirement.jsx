import React, { useState, useEffect } from 'react';
import { Minus, Plus, Loader2, Save, CalendarX, ShoppingBag, CheckCircle2, X, Droplets } from 'lucide-react';
import api from '../../services/client';
import toast from 'react-hot-toast';
import ConfirmDialog from '../common/ConfirmDialog';

const PRODUCT_IMAGES = {
  'Cow Milk': '/images/product1.png',
  'Buffalo Milk': '/images/product2.png',
  'Curd': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop',
  'Paneer': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&h=200&fit=crop',
  'Ghee': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200&h=200&fit=crop',
  default: '/images/product3.png',
};

const Requirement = () => {
  const [loading, setLoading] = useState(true);
  const [skipToCancel, setSkipToCancel] = useState(null);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [requirements, setRequirements] = useState({});
  const [addons, setAddons] = useState([]);

  // Skip modal state
  const [skipModal, setSkipModal] = useState(false);
  const [skipDate, setSkipDate] = useState('');
  const [skipEndDate, setSkipEndDate] = useState('');
  const [skipReason, setSkipReason] = useState('');
  const [submittingSkip, setSubmittingSkip] = useState(false);
  const [skips, setSkips] = useState([]);

  // Add-on modal state
  const [addonModal, setAddonModal] = useState(false);
  const [addonProductId, setAddonProductId] = useState('');
  const [addonDate, setAddonDate] = useState('');
  const [addonQty, setAddonQty] = useState(1);
  const [submittingAddon, setSubmittingAddon] = useState(false);

  // Quantity Change Modal State
  const [qtyModal, setQtyModal] = useState(false);
  const [qtyEffectiveDate, setQtyEffectiveDate] = useState('');
  const [qtyReason, setQtyReason] = useState('');


  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [dashRes, subRes, addonRes, skipRes] = await Promise.allSettled([
        api.get('/customer/dashboard'),
        api.get('/customer/subscriptions'),
        api.get('/customer/addons'),
        api.get('/customer/skips'),
      ]);

      if (dashRes.status === 'fulfilled') {
        const data = dashRes.value.data;
        setProducts(data.products || []);
        if (Array.isArray(data.requirements)) {
          const m = {};
          data.requirements.forEach(r => { m[r.product_id] = parseFloat(r.quantity); });
          setRequirements(m);
        } else if (data.requirements) {
          setRequirements(data.requirements);
        }
      }

      if (subRes.status === 'fulfilled') {
        const subs = subRes.value.data?.subscriptions || (Array.isArray(subRes.value.data) ? subRes.value.data : []);
        if (subs.length > 0) {
          const sMap = {};
          subs.forEach(s => { sMap[s.product_id] = s.quantity_per_day; });
          setRequirements(sMap);
        }
      }

      if (addonRes.status === 'fulfilled') {
        setAddons(addonRes.value.data || []);
      }
      if (skipRes.status === 'fulfilled') {
        setSkips(skipRes.value.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRequirement = (productId, delta) => {
    setRequirements(prev => {
      const current = prev[productId] || 0;
      return { ...prev, [productId]: Math.max(0, current + delta) };
    });
  };


  const handleSave = async () => {
    // Instead of saving directly, open the confirmation modal
    setQtyEffectiveDate(tomorrow);
    setQtyModal(true);
  };

  const handleConfirmQtyChange = async () => {
    if (!qtyEffectiveDate) return toast.error('Please select an effective date.');
    setSaving(true);
    try {
      const requests = Object.entries(requirements).map(([productId, qty]) => ({
        product_id: parseInt(productId),
        requested_quantity: qty,
        effective_date: qtyEffectiveDate,
        reason: qtyReason
      }));
      await api.post('/customer/change-quantity', { requests });
      toast.success('Quantity change request submitted for admin approval!');
      setQtyModal(false);
      fetchAll();
    } catch (err) {
      toast.error('Failed to submit request.');
    } finally {
      setSaving(false);
    }
  };


  const handleSkipSubmit = async () => {
    if (!skipDate) return toast.error('Please select a start date to skip.');
    setSubmittingSkip(true);
    try {
      await api.post('/customer/skip', { skip_date: skipDate, skip_end_date: skipEndDate || skipDate, reason: skipReason });
      const msg = skipEndDate && skipEndDate !== skipDate ? `Deliveries from ${skipDate} to ${skipEndDate} have been skipped.` : `Delivery on ${skipDate} has been skipped.`;
      toast.success(msg);
      setSkipModal(false);
      setSkipDate(''); setSkipEndDate(''); setSkipReason('');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSubmittingSkip(false);
    }
  };

  const handleCancelSkip = (id) => {
    setSkipToCancel(id);
  };

  const executeCancelSkip = async () => {
    if (!skipToCancel) return;
    try {
      await api.delete(`/customer/skips/${skipToCancel}`);
      toast.success('Skip cancelled successfully.');
      fetchAll();
    } catch (e) {
      toast.error('Failed to cancel skip.');
    } finally {
      setSkipToCancel(null);
    }
  };

  const handleAddonSubmit = async () => {
    if (!addonProductId || !addonDate) return toast.error('Select product and date.');
    setSubmittingAddon(true);
    try {
      await api.post('/customer/addons', {
        product_id: parseInt(addonProductId),
        delivery_date: addonDate,
        quantity: addonQty,
        addon_quantity: addonQty,
      });
      toast.success(`Add-on of ${addonQty} units requested for ${addonDate}!`);
      setAddonModal(false);
      setAddonProductId(''); setAddonDate(''); setAddonQty(1);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSubmittingAddon(false);
    }
  };

  if (loading) {
    return <div className="flex-1 flex justify-center items-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-[#0D47A1]" /></div>;
  }

  const totalItems = Object.values(requirements).reduce((a, b) => a + (b > 0 ? 1 : 0), 0);
  const totalAmount = Object.entries(requirements).reduce((total, [pid, qty]) => {
    const prod = products.find(p => p.id == pid);
    return total + (prod ? parseFloat(prod.price_per_unit || prod.price || 0) * qty : 0);
  }, 0);

  const upcomingAddons = (Array.isArray(addons) ? addons : []).filter(a => a.delivery_date >= today).slice(0, 5);

  return (
    <div className="md:p-2 bg-slate-50 min-h-full font-['Poppins']">
      <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-6">

        {/* ─── HEADER ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">My Daily Subscription</h2>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Set quantities delivered every day. Billed monthly based on actual deliveries.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setSkipDate(tomorrow); setSkipModal(true); }}
              className="flex items-center gap-2 px-4 py-2.5 border-2 border-amber-300 text-amber-700 bg-amber-50 rounded-xl font-bold text-sm hover:bg-amber-100 transition-colors"
            >
              <CalendarX className="w-4 h-4" /> Skip a Day
            </button>
            <button
              onClick={() => { setAddonDate(tomorrow); setAddonModal(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors shadow-md shadow-green-600/20"
            >
              <ShoppingBag className="w-4 h-4" /> Request Add-on
            </button>
          </div>
        </div>

        {/* ─── PRODUCT GRID ─── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h3 className="text-base font-extrabold text-gray-800 mb-6 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-[#0D47A1]" /> Daily Products
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {products.map(product => {
              const qty = requirements[product.id] || 0;
              return (
                <div key={product.id} className={`rounded-2xl border p-4 flex flex-col items-center transition-all hover:-translate-y-1 hover:shadow-md ${qty > 0 ? 'border-blue-200 bg-blue-50/40' : 'border-gray-100 bg-white shadow-sm'}`}>
                  <div className="w-full h-28 mb-3 flex items-center justify-center p-2 bg-slate-50 rounded-xl">
                    <img
                      src={PRODUCT_IMAGES[product.name] || PRODUCT_IMAGES.default}
                      alt={product.name}
                      className="h-full w-full object-contain drop-shadow-md"
                      onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                    <div className="hidden items-center justify-center text-4xl">
                      {product.name.includes('Milk') ? '🥛' : product.name === 'Curd' ? '🥣' : product.name === 'Paneer' ? '🧀' : '🍯'}
                    </div>
                  </div>
                  <h4 className="text-sm font-extrabold text-gray-800 text-center mb-0.5">{product.name}</h4>
                  <p className="text-xs text-gray-500 mb-2">{product.unit}</p>
                  <p className="text-sm font-extrabold text-[#0D47A1] mb-4">
                    ₹{product.price_per_unit || product.price} <span className="text-xs text-gray-400 font-medium">/{product.unit}</span>
                  </p>
                  {qty > 0 && (
                    <div className="w-full mb-2">
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active Subscription
                      </span>
                    </div>
                  )}
                  <div className="w-full bg-slate-50 rounded-xl border border-gray-100 flex items-center justify-between p-1.5">
                    <button onClick={() => handleUpdateRequirement(product.id, -1)} className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#0D47A1] font-bold hover:bg-gray-50 active:scale-95 transition-all">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-extrabold text-base text-gray-800 w-8 text-center">{qty}</span>
                    <button onClick={() => handleUpdateRequirement(product.id, 1)} className="w-8 h-8 rounded-lg bg-[#0D47A1] shadow-sm flex items-center justify-center text-white font-bold hover:bg-blue-800 active:scale-95 transition-all">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save Footer */}
          <div className="mt-8 bg-blue-50 rounded-2xl border border-blue-100 p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Estimated Daily Cost</p>
              <div className="flex items-end gap-3">
                <p className="text-3xl font-extrabold text-[#0D47A1]">₹{totalAmount.toFixed(2)}</p>
                <p className="text-sm font-medium text-gray-500 mb-1">for {totalItems} products/day</p>
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} className="w-full md:w-auto bg-[#0D47A1] text-white px-8 py-4 rounded-xl font-bold text-base shadow-lg shadow-blue-900/20 hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Subscription
            </button>
          </div>
        </div>

        {/* 🏖️ UPCOMING PAUSES (SKIPS) */}
        {skips.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-base font-extrabold text-gray-800 mb-4 flex items-center gap-2">
              <CalendarX className="w-5 h-5 text-amber-500" /> Upcoming Pauses
            </h3>
            <div className="space-y-3">
              {skips.map(skip => (
                <div key={skip.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="text-sm font-bold text-gray-800">{new Date(skip.skip_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                    {skip.reason && <div className="text-xs text-gray-500 mt-1">{skip.reason}</div>}
                  </div>
                  <button onClick={() => handleCancelSkip(skip.id)} className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                    Cancel Skip
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🔥🔥🔥 UPCOMING ADD-ONS 🔥🔥🔥 */}
        {upcomingAddons.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-extrabold text-gray-800 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-green-600" /> Upcoming Add-ons
            </h3>
            <div className="space-y-3">
              {upcomingAddons.map(addon => (
                <div key={addon.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{addon.product_name || `Product #${addon.product_id}`}</p>
                    <p className="text-xs text-gray-500 font-medium">{addon.delivery_date} · +{addon.addon_quantity || addon.quantity} {addon.product_unit || addon.unit || 'L'}</p>
                  </div>
                  <span className="text-sm font-extrabold text-green-700 bg-green-50 px-3 py-1 rounded-lg">₹{parseFloat(addon.total_amount).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── SKIP MODAL ─── */}
      {skipModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-gray-900">Skip a Delivery</h3>
              <button onClick={() => setSkipModal(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Start Date</label>
                  <input type="date" value={skipDate} min={today} onChange={e => setSkipDate(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-amber-300 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">End Date (Optional)</label>
                  <input type="date" value={skipEndDate} min={skipDate || today} onChange={e => setSkipEndDate(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-amber-300 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Reason (optional)</label>
                <input type="text" value={skipReason} onChange={e => setSkipReason(e.target.value)} placeholder="e.g., Traveling, function at home" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-300 outline-none" />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs font-medium text-amber-800">
                ⚠️ You will NOT be billed for this day as delivery will be marked skipped.
              </div>
              <button onClick={handleSkipSubmit} disabled={submittingSkip} className="w-full bg-amber-500 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-600 transition-colors disabled:opacity-70">
                {submittingSkip ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarX className="w-4 h-4" />}
                Confirm Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── ADD-ON MODAL ─── */}
      {addonModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-gray-900">Request Extra Add-on</h3>
              <button onClick={() => setAddonModal(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Product</label>
                <select value={addonProductId} onChange={e => setAddonProductId(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-green-300 outline-none bg-white">
                  <option value="">Select product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} — ₹{p.price_per_unit || p.price}/{p.unit}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Delivery Date</label>
                <input type="date" value={addonDate} min={today} onChange={e => setAddonDate(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-green-300 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Additional Quantity</label>
                <div className="flex items-center gap-4">
                  <button onClick={() => setAddonQty(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-xl bg-gray-100 font-bold flex items-center justify-center hover:bg-gray-200">−</button>
                  <span className="text-2xl font-extrabold text-gray-800 w-12 text-center">{addonQty}</span>
                  <button onClick={() => setAddonQty(q => q + 1)} className="w-10 h-10 rounded-xl bg-green-600 text-white font-bold flex items-center justify-center hover:bg-green-700">+</button>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs font-medium text-green-800">
                ✅ This add-on applies to the selected date only. It will not change your regular subscription.
              </div>
              <button onClick={handleAddonSubmit} disabled={submittingAddon} className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-70">
                {submittingAddon ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
                Confirm Add-on
              </button>
            </div>
          </div>
        </div>
      )}
    
      <ConfirmDialog
        isOpen={Boolean(skipToCancel)}
        title="Cancel Delivery Pause"
        message="Are you sure you want to cancel this scheduled delivery skip?"
        confirmText="Cancel Skip"
        onConfirm={executeCancelSkip}
        onCancel={() => setSkipToCancel(null)}
      />
    </div>
  );
};

export default Requirement;
