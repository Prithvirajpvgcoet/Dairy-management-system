import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Phone, Mail, MapPin, Clock, MessageSquare, 
  HelpCircle, Search, Send, ShieldCheck, ChevronRight, CheckCircle2 
} from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import api from '../api/client';
import toast from 'react-hot-toast';

const CONTACT_TABS = [
  { id: 'contact', label: 'Contact Us', icon: Phone },
  { id: 'faq', label: 'Frequently Asked Questions', icon: HelpCircle },
  { id: 'track', label: 'Track Order / Status', icon: Clock },
  { id: 'locator', label: 'Pune Store Locator', icon: MapPin },
  { id: 'feedback', label: 'Share Feedback', icon: MessageSquare },
  { id: 'grievance', label: 'Grievance Redressal', icon: ShieldCheck }
];

const STORES = [
  {
    name: 'Amarale Dairy Main Office & Processing',
    address: 'Plot 42, Amarale Chowk, Paud Road, Kothrud, Pune - 411038',
    phone: '020-25448900',
    timing: '5:00 AM - 9:00 PM Daily'
  },
  {
    name: 'Karve Nagar Distribution Hub',
    address: 'Near Pratibha Hospital, Dnyaneshwar Paduka Chowk, Karve Nagar, Pune - 411052',
    phone: '+91 98765 43211',
    timing: '5:30 AM - 1:00 PM & 4:30 PM - 8:30 PM'
  },
  {
    name: 'Baner & Balewadi Route Center',
    address: 'Shop 4, Green Terraces, Pancard Club Road, Baner, Pune - 411045',
    phone: '+91 98765 43212',
    timing: '6:00 AM - 12:00 PM & 5:00 PM - 8:30 PM'
  },
  {
    name: 'Aundh Morning Depot',
    address: 'Near Medipoint Hospital, DP Road, Aundh, Pune - 411007',
    phone: '+91 98765 43213',
    timing: '5:30 AM - 11:30 AM Daily'
  }
];

export default function ContactPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'contact';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && CONTACT_TABS.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Form states
  const [formKind, setFormKind] = useState('CONTACT');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    website: '' // Honeypot
  });
  const [submitting, setSubmitting] = useState(false);

  // FAQs
  const [faqs, setFaqs] = useState([]);
  const [faqSearch, setFaqSearch] = useState('');

  // Track Order
  const [trackQuery, setTrackQuery] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  useEffect(() => {
    api.get('/faqs')
      .then(res => setFaqs(res.data || []))
      .catch(() => {});
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    searchParams.set('tab', tabId);
    setSearchParams(searchParams);
  };

  const handleFormSubmit = async (e, kindOverride) => {
    e.preventDefault();
    const kind = kindOverride || formKind;
    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/contact', {
        ...formData,
        kind
      });
      toast.success(res.data.message || 'Message sent successfully!');
      setFormData({ name: '', email: '', phone: '', message: '', website: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackLookup = async (e) => {
    e.preventDefault();
    if (!trackQuery.trim()) {
      toast.error('Please enter your phone number or customer ID');
      return;
    }

    try {
      setTrackingLoading(true);
      setTrackResult(null);
      const res = await api.get(`/track-order/${encodeURIComponent(trackQuery.trim())}`);
      setTrackResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'No active customer record found');
    } finally {
      setTrackingLoading(false);
    }
  };

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(faqSearch.toLowerCase()) || 
    f.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <PublicLayout>
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold text-[#0D47A1] uppercase tracking-wider">Here To Help</span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-1">
            Contact & Support
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-2 max-w-2xl leading-relaxed">
            Have questions about morning delivery, billing, or route coverage in Pune? Our local team is available 7 days a week.
          </p>
        </div>
      </div>

      {/* ── Main Layout with Sidebar ── */}
      <div className="py-12 sm:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Sidebar */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-4 border border-slate-200 shadow-sm sticky top-24">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-4 py-2">
                Help Topics
              </h3>
              <div className="space-y-1">
                {CONTACT_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all text-left ${
                        active
                          ? 'bg-[#0D47A1] text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                        <span>{tab.label}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${active ? 'opacity-100' : 'opacity-30'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Direct Callout */}
              <div className="mt-6 p-4 rounded-2xl bg-blue-50 border border-blue-100 space-y-2">
                <p className="text-xs font-bold text-[#0D47A1] uppercase">Immediate Morning Assistance</p>
                <p className="text-xs text-slate-600">Morning Route Desk: 6:00 AM - 10:00 AM</p>
                <a
                  href="tel:+919876543210"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#0D47A1] hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" /> Call +91 98765 43210
                </a>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm min-h-[500px]">
              
              {/* TAB 1: CONTACT US */}
              {activeTab === 'contact' && (
                <div className="space-y-8 animate-in fade-in-50">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Get in Touch with Amarale Dairy</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Send us an inquiry or reach our Pune customer support desk directly.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <Phone className="w-5 h-5 text-[#0D47A1] mb-2" />
                      <p className="text-xs font-bold text-slate-700">Phone & WhatsApp</p>
                      <p className="text-xs text-slate-500 mt-0.5">+91 98765 43210</p>
                      <p className="text-[11px] text-slate-400">020-25448900 (Landline)</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <Mail className="w-5 h-5 text-amber-500 mb-2" />
                      <p className="text-xs font-bold text-slate-700">Email Support</p>
                      <p className="text-xs text-slate-500 mt-0.5">care@amaraledairy.com</p>
                      <p className="text-[11px] text-slate-400">Response within 2 hours</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <Clock className="w-5 h-5 text-emerald-500 mb-2" />
                      <p className="text-xs font-bold text-slate-700">Operational Hours</p>
                      <p className="text-xs text-slate-500 mt-0.5">6:00 AM - 9:00 PM</p>
                      <p className="text-[11px] text-slate-400">Open 365 days a year</p>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={(e) => handleFormSubmit(e, 'CONTACT')} className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">Send an Inquiry</h3>

                    {/* Bot Honeypot hidden input */}
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      style={{ display: 'none' }}
                      tabIndex="-1"
                      autoComplete="off"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Your Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#0D47A1] focus:outline-none"
                          placeholder="e.g. Ramesh Kulkarni"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#0D47A1] focus:outline-none"
                          placeholder="e.g. 9876543210"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#0D47A1] focus:outline-none"
                        placeholder="e.g. ramesh@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Message / Requirements *</label>
                      <textarea
                        rows="4"
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#0D47A1] focus:outline-none"
                        placeholder="Tell us what dairy products or routes you are interested in..."
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 rounded-xl bg-[#0D47A1] hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md transition-colors disabled:opacity-50"
                    >
                      {submitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: FAQS */}
              {activeTab === 'faq' && (
                <div className="space-y-6 animate-in fade-in-50">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Frequently Asked Questions</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Everything you need to know about deliveries, billing, quality, and pauses.
                    </p>
                  </div>

                  {/* Search FAQ */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search questions (e.g. skip delivery, billing, quality)..."
                      value={faqSearch}
                      onChange={(e) => setFaqSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D47A1] bg-slate-50"
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    {filteredFaqs.map((faq) => (
                      <div key={faq.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
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
                </div>
              )}

              {/* TAB 3: TRACK ORDER */}
              {activeTab === 'track' && (
                <div className="space-y-6 animate-in fade-in-50">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Track Morning Delivery & Route</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Check your assigned delivery partner and today's delivery status by entering your registered mobile number.
                    </p>
                  </div>

                  <form onSubmit={handleTrackLookup} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Enter registered mobile number (e.g. 9876543210)"
                      value={trackQuery}
                      onChange={(e) => setTrackQuery(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#0D47A1] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={trackingLoading}
                      className="px-6 py-3 rounded-xl bg-[#0D47A1] hover:bg-blue-800 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm disabled:opacity-50"
                    >
                      {trackingLoading ? 'Checking...' : 'Track Delivery'}
                    </button>
                  </form>

                  {trackResult && (
                    <div className="p-6 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-blue-900">Customer Details</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          trackResult.todayStatus === 'DELIVERED' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {trackResult.todayStatus}
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-slate-900">{trackResult.customerName}</h4>
                      <p className="text-xs text-slate-600">📍 {trackResult.address}</p>

                      <div className="pt-3 border-t border-blue-200/60 grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-slate-500">Delivery Partner:</span>
                          <p className="font-bold text-slate-900">{trackResult.deliveryPartner}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Delivered At:</span>
                          <p className="font-bold text-slate-900">
                            {trackResult.deliveredAt ? new Date(trackResult.deliveredAt).toLocaleTimeString() : 'In transit'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: STORE LOCATOR */}
              {activeTab === 'locator' && (
                <div className="space-y-6 animate-in fade-in-50">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Pune Store & Distribution Centers</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Pick up fresh butter, paneer, and curd directly from our retail centers across Pune.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {STORES.map((st, idx) => (
                      <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-5 h-5 text-[#0D47A1] shrink-0 mt-0.5" />
                          <h4 className="font-bold text-slate-900 text-sm">{st.name}</h4>
                        </div>
                        <p className="text-xs text-slate-500 pl-7 leading-relaxed">{st.address}</p>
                        <p className="text-xs font-medium text-slate-700 pl-7">📞 {st.phone}</p>
                        <p className="text-[11px] text-slate-400 pl-7">⏰ {st.timing}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: FEEDBACK FORM */}
              {activeTab === 'feedback' && (
                <div className="space-y-6 animate-in fade-in-50">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Share Your Feedback</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Your experience helps us maintain the purest milk quality and morning delivery punctuality.
                    </p>
                  </div>

                  <form onSubmit={(e) => handleFormSubmit(e, 'FEEDBACK')} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Your Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#0D47A1] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#0D47A1] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#0D47A1] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Your Feedback & Suggestions *</label>
                      <textarea
                        rows="4"
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#0D47A1] focus:outline-none"
                        placeholder="Tell us about the delivery punctuality, milk taste, or app convenience..."
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-colors disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 6: GRIEVANCE REDRESSAL */}
              {activeTab === 'grievance' && (
                <div className="space-y-6 animate-in fade-in-50">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Grievance Redressal Mechanism</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Statutory consumer grievance mechanism under the Consumer Protection (E-Commerce) Rules, 2020.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                    <b>Grievance Officer:</b> Shri S. Amarale, Director of Quality & Compliance. <br />
                    Address: Amarale Dairy Head Office, Plot 42 Paud Road, Kothrud, Pune - 411038. <br />
                    Email: grievance@amaraledairy.com | Turnaround time: 48 working hours.
                  </div>

                  <form onSubmit={(e) => handleFormSubmit(e, 'GRIEVANCE')} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Customer Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#0D47A1] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Phone *</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#0D47A1] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#0D47A1] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Details of Grievance *</label>
                      <textarea
                        rows="4"
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#0D47A1] focus:outline-none"
                        placeholder="Please describe the issue with delivery date, invoice number, or partner behavior..."
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md transition-colors disabled:opacity-50"
                    >
                      {submitting ? 'Registering Grievance...' : 'Submit Grievance'}
                    </button>
                  </form>
                </div>
              )}

            </div>

          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
