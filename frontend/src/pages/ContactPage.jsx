import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Phone, Mail, MapPin, Clock, MessageSquare, 
  HelpCircle, Search, Send, ShieldCheck, ChevronRight, MessageCircle 
} from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import api from '../api/client';
import toast from 'react-hot-toast';

const CONTACT_TABS = [
  { id: 'contact', label: 'Contact Us', icon: Phone },
  { id: 'faq', label: 'FAQs', icon: HelpCircle },
  { id: 'track', label: 'Track Order', icon: Clock },
  { id: 'locator', label: 'Store Locator', icon: MapPin },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  { id: 'grievance', label: 'Grievance Redressal', icon: ShieldCheck }
];

export default function ContactPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'contact');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    website: ''
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
    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/contact', {
        ...formData,
        kind: kindOverride || (activeTab === 'feedback' ? 'FEEDBACK' : activeTab === 'grievance' ? 'GRIEVANCE' : 'CONTACT')
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

  return (
    <PublicLayout>
      {/* ── Top Hero Banner (Mockup exact) ── */}
      <div className="relative bg-[#0A2540] text-white py-14 sm:py-18 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">We're Here to Help</h1>
            <p className="text-sm sm:text-base text-blue-200 mt-2 max-w-xl">
              Your satisfaction is our priority. Get in touch with us anytime.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md bg-white">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop"
                alt="Support Agent"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-serif italic text-amber-300 text-sm font-semibold">
              Always Here for You ♡
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Layout with Left Sidebar (Mockup exact) ── */}
      <div className="py-12 sm:py-16 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Sidebar */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-3 border border-slate-200 shadow-xs">
              <div className="space-y-1">
                {CONTACT_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-left ${
                        active
                          ? 'bg-[#0B5ED7] text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                        <span>{tab.label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 ${active ? 'opacity-100' : 'opacity-40'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-8">
              
              {/* TAB 1: CONTACT US (Mockup exact) */}
              {activeTab === 'contact' && (
                <div className="space-y-8 animate-in fade-in-50">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Get in Touch</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Have a question, suggestion or need help? Reach out to us through any of the channels below.
                    </p>
                  </div>

                  {/* 4 Cards (Mockup exact) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0B5ED7] flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase">Call Us</h4>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">+91 98765 43210</p>
                        <p className="text-[11px] text-slate-400">Mon - Sun: 6:00 AM - 9:00 PM</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0B5ED7] flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase">Email Us</h4>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">care@amaraledairy.com</p>
                        <p className="text-[11px] text-slate-400">We reply within 24 hours</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0B5ED7] flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase">Visit Us</h4>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">Pune, Maharashtra</p>
                        <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="text-[11px] text-[#0B5ED7] font-semibold hover:underline">
                          Find on Google Maps
                        </a>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase">WhatsApp Us</h4>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">+91 98765 43210</p>
                        <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="text-[11px] text-emerald-600 font-semibold hover:underline">
                          Chat with us
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Send Us a Message Form (Mockup exact) */}
                  <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-black text-slate-900 mb-4">Send Us a Message</h3>
                    
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      {/* Bot Honeypot */}
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
                          <input
                            type="text"
                            required
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#0B5ED7] focus:outline-none"
                          />
                        </div>
                        <div>
                          <input
                            type="email"
                            required
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#0B5ED7] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <input
                          type="tel"
                          required
                          placeholder="Phone Number"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#0B5ED7] focus:outline-none"
                        />
                      </div>

                      <div>
                        <textarea
                          rows="4"
                          required
                          placeholder="Your Message"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#0B5ED7] focus:outline-none"
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-3 rounded-xl bg-[#0B5ED7] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <span>Send Message</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 2: FAQS */}
              {activeTab === 'faq' && (
                <div className="space-y-6 animate-in fade-in-50">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
                  <div className="space-y-3">
                    {faqs.map((faq) => (
                      <div key={faq.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-[#0B5ED7] shrink-0" />
                          {faq.question}
                        </h4>
                        <p className="text-xs text-slate-600 mt-2 pl-6 leading-relaxed">
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
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Track Your Delivery</h2>
                  <form onSubmit={handleTrackLookup} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter mobile number"
                      value={trackQuery}
                      onChange={(e) => setTrackQuery(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#0B5ED7] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={trackingLoading}
                      className="px-5 py-2.5 rounded-xl bg-[#0B5ED7] text-white font-bold text-xs shadow-xs"
                    >
                      {trackingLoading ? 'Checking...' : 'Track'}
                    </button>
                  </form>

                  {trackResult && (
                    <div className="p-5 rounded-xl bg-blue-50 border border-blue-200 text-xs space-y-2">
                      <p className="font-bold text-slate-900">{trackResult.customerName}</p>
                      <p className="text-slate-600">Address: {trackResult.address}</p>
                      <p className="text-slate-600">Status: <b className="text-emerald-700">{trackResult.todayStatus}</b></p>
                      <p className="text-slate-600">Partner: {trackResult.deliveryPartner}</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: STORE LOCATOR */}
              {activeTab === 'locator' && (
                <div className="space-y-4 animate-in fade-in-50">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pune Store Locator</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <h4 className="font-bold text-slate-900 text-sm">Main Kothrud Dairy Center</h4>
                      <p className="text-xs text-slate-500 mt-1">Plot 42, Paud Road, Kothrud, Pune - 411038</p>
                      <p className="text-xs font-semibold text-[#0B5ED7] mt-2">Open Daily: 5:00 AM - 9:00 PM</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <h4 className="font-bold text-slate-900 text-sm">Karve Nagar Distribution Depot</h4>
                      <p className="text-xs text-slate-500 mt-1">Dnyaneshwar Paduka Chowk, Karve Nagar, Pune</p>
                      <p className="text-xs font-semibold text-[#0B5ED7] mt-2">Open Daily: 5:30 AM - 8:30 PM</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: FEEDBACK */}
              {activeTab === 'feedback' && (
                <div className="space-y-4 animate-in fade-in-50">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Share Your Feedback</h2>
                  <p className="text-xs text-slate-500">We appreciate your suggestions to improve morning deliveries.</p>
                  <form onSubmit={(e) => handleFormSubmit(e, 'FEEDBACK')} className="space-y-3">
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#0B5ED7] focus:outline-none"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#0B5ED7] focus:outline-none"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#0B5ED7] focus:outline-none"
                    />
                    <textarea
                      rows="4"
                      required
                      placeholder="Your Feedback & Suggestions..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#0B5ED7] focus:outline-none"
                    ></textarea>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs"
                    >
                      {submitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 6: GRIEVANCE REDRESSAL */}
              {activeTab === 'grievance' && (
                <div className="space-y-4 animate-in fade-in-50">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Grievance Redressal</h2>
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                    Officer: Shri S. Amarale | Email: grievance@amaraledairy.com | Resolution SLA: 48 Hours.
                  </div>
                  <form onSubmit={(e) => handleFormSubmit(e, 'GRIEVANCE')} className="space-y-3">
                    <input
                      type="text"
                      required
                      placeholder="Customer Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#0B5ED7] focus:outline-none"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Contact Phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#0B5ED7] focus:outline-none"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#0B5ED7] focus:outline-none"
                    />
                    <textarea
                      rows="4"
                      required
                      placeholder="Detailed Description of Grievance..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#0B5ED7] focus:outline-none"
                    ></textarea>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow-xs"
                    >
                      {submitting ? 'Registering...' : 'Register Formal Grievance'}
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
