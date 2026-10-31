const fs = require('fs');
let c = fs.readFileSync('frontend/src/components/customer/Requirement.jsx', 'utf8');

const changeQtyState = `
  // Quantity Change Modal State
  const [qtyModal, setQtyModal] = useState(false);
  const [qtyEffectiveDate, setQtyEffectiveDate] = useState('');
  const [qtyReason, setQtyReason] = useState('');
`;
c = c.replace('const [addonQty, setAddonQty] = useState(1);\n  const [submittingAddon, setSubmittingAddon] = useState(false);', 'const [addonQty, setAddonQty] = useState(1);\n  const [submittingAddon, setSubmittingAddon] = useState(false);\n' + changeQtyState);

c = c.replace(`  const handleSave = async () => {
    setSaving(true);
    try {
      // Use new subscription endpoint if available, fallback to old
      for (const [productId, qty] of Object.entries(requirements)) {
        if (qty > 0) {
          await api.post('/customer/subscriptions', {
            product_id: parseInt(productId),
            quantity_per_day: qty,
          }).catch(() =>
            api.post('/customer/requirements', { requirements })
          );
        }
      }
      alert('✅ Subscription updated successfully!');
      fetchAll();
    } catch (err) {
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };`,
`
  const handleSave = async () => {
    // Instead of saving directly, open the confirmation modal
    setQtyEffectiveDate(tomorrow);
    setQtyModal(true);
  };

  const handleConfirmQtyChange = async () => {
    if (!qtyEffectiveDate) return alert('Please select an effective date.');
    setSaving(true);
    try {
      const requests = Object.entries(requirements).map(([productId, qty]) => ({
        product_id: parseInt(productId),
        requested_quantity: qty,
        effective_date: qtyEffectiveDate,
        reason: qtyReason
      }));
      await api.post('/customer/change-quantity', { requests });
      alert('Quantity change request submitted for admin approval!');
      setQtyModal(false);
      fetchAll();
    } catch (err) {
      alert('Failed to submit request.');
    } finally {
      setSaving(false);
    }
  };
`);

const qtyModalUI = `
      {/* QUANTITY CHANGE CONFIRMATION MODAL */}
      {qtyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-gray-900">Confirm Subscription Change</h3>
              <button onClick={() => setQtyModal(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800">Your new subscription requires Admin approval before taking effect.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Effective Date</label>
                <input type="date" value={qtyEffectiveDate} min={tomorrow} onChange={e => setQtyEffectiveDate(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-300 outline-none bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Reason (optional)</label>
                <input type="text" value={qtyReason} onChange={e => setQtyReason(e.target.value)} placeholder="e.g., Guests arriving, changing diet" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-300 outline-none" />
              </div>
              <button onClick={handleConfirmQtyChange} disabled={saving} className="w-full bg-[#0D47A1] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-800 transition-colors disabled:opacity-70 mt-4">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
`;

c = c.replace('{/* ⏭️ SKIP MODAL ⏭️ */}', qtyModalUI + '\n\n      {/* ⏭️ SKIP MODAL ⏭️ */}');

fs.writeFileSync('frontend/src/components/customer/Requirement.jsx', c);
console.log('patched customer Requirement UI for qty changes');
