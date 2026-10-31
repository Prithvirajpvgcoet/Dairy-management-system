import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Phone, Mail, MapPin, Clock, Search, ShoppingBag, 
  Menu, X, ShieldCheck, ChevronRight, User, ExternalLink, Heart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function PublicLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Our Products', href: '/products' },
    { label: 'Subscriptions', href: '/subscriptions' },
    { label: 'Our Story', href: '/our-story' },
    { label: 'Quality & Infrastructure', href: '/quality' },
    { label: 'Contact Us', href: '/contact' }
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-[#0D47A1] selection:text-white">
      {/* ── Top Utility Bar ── */}
      <div className="bg-[#0A2540] text-slate-200 text-xs py-2 px-4 border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-center md:text-left flex-wrap justify-center">
            <span className="flex items-center gap-1.5 font-medium text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Fresh dairy delivered to your doorstep every morning by 7:00 AM
            </span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-slate-300">📍 Serving Pune</span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-amber-300 font-semibold">Since 1976</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-slate-300">
            <Link to="/contact?tab=track" className="hover:text-white flex items-center gap-1 transition-colors">
              <Clock className="w-3.5 h-3.5 text-blue-400" /> Track Order
            </Link>
            <Link to="/contact?tab=locator" className="hover:text-white flex items-center gap-1 transition-colors">
              <MapPin className="w-3.5 h-3.5 text-blue-400" /> Store Locator
            </Link>
            <Link to="/contact?tab=faq" className="hover:text-white flex items-center gap-1 transition-colors">
              Help & FAQs
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Navigation ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform">
              <img 
                src="/images/logo.jpg" 
                alt="Amarale Dairy" 
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<span class="text-xl font-black text-[#0D47A1]">AD</span>';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-[#0D47A1]">
                  अमराळे
                </span>
                <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 bg-blue-100 text-[#0D47A1] rounded-full">
                  Dairy
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-wide">Pure Farm Milk • Purity Guaranteed</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    active
                      ? 'text-[#0D47A1] bg-blue-50 font-bold'
                      : 'text-slate-600 hover:text-[#0D47A1] hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link
                to={user.role === 'ADMIN' ? '/admin' : user.role === 'DELIVERY_BOY' ? '/delivery' : '/customer'}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0D47A1] font-semibold text-sm border border-blue-200 transition-colors shadow-sm"
              >
                <User className="w-4 h-4" />
                <span>My Dashboard ({user.name.split(' ')[0]})</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-[#0D47A1] transition-colors"
                >
                  Customer Login
                </Link>
                <Link
                  to="/subscriptions"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0D47A1] hover:bg-blue-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
                >
                  <span>Start Subscription</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login?role=admin"
                  title="Staff & Management Login"
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Admin</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2">
            <div className="space-y-1 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-semibold ${
                    isActive(link.href)
                      ? 'bg-blue-50 text-[#0D47A1]'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#0D47A1]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              {user ? (
                <Link
                  to={user.role === 'ADMIN' ? '/admin' : user.role === 'DELIVERY_BOY' ? '/delivery' : '/customer'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl bg-[#0D47A1] text-white font-semibold shadow"
                >
                  Go to {user.role} Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/subscriptions"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-xl bg-[#0D47A1] text-white font-semibold shadow"
                  >
                    Subscribe Daily Milk
                  </Link>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-center py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-700"
                    >
                      Customer Login
                    </Link>
                    <Link
                      to="/login?role=admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-center py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-600 bg-slate-50"
                    >
                      Admin Portal
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Main Content Area ── */}
      <main className="flex-1">
        {children}
      </main>

      {/* ── Dark-Blue Footer ── */}
      <footer className="bg-[#0A192F] text-slate-300 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            {/* Col 1: Brand & Legacy */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 p-2 border border-white/10 flex items-center justify-center">
                  <span className="text-2xl font-black text-amber-400">अ</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">अमराळे डेअरी (Amarale Dairy)</h3>
                  <p className="text-xs text-blue-300 font-medium">Amarale Dairy & Food Products Pvt. Ltd.</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed pr-6">
                Delivering 100% pure, farm-fresh milk, organic curd, malai paneer, and bilona ghee to Pune homes every morning since 1976. Chilled to 4°C within 60 minutes of milking with 24-point laboratory purity checks.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> FSSAI Certified
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/70 border border-blue-500/30 text-blue-300 text-xs font-semibold">
                  Zero Preservatives
                </span>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Quick Links</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
                <li><Link to="/products" className="hover:text-blue-400 transition-colors">Our Products</Link></li>
                <li><Link to="/subscriptions" className="hover:text-blue-400 transition-colors">Milk Subscriptions</Link></li>
                <li><Link to="/our-story" className="hover:text-blue-400 transition-colors">Our Story & Heritage</Link></li>
                <li><Link to="/quality" className="hover:text-blue-400 transition-colors">Quality & Infrastructure</Link></li>
                <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Contact & Support</Link></li>
              </ul>
            </div>

            {/* Col 3: Products */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Dairy Catalog</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/products?category=Milk" className="hover:text-blue-400 transition-colors">A2 Cow Milk (1L)</Link></li>
                <li><Link to="/products?category=Milk" className="hover:text-blue-400 transition-colors">Fresh Buffalo Milk (1L)</Link></li>
                <li><Link to="/products?category=Curd%20and%20Yogurt" className="hover:text-blue-400 transition-colors">Natural Probiotic Curd</Link></li>
                <li><Link to="/products?category=Paneer" className="hover:text-blue-400 transition-colors">Artisanal Malai Paneer</Link></li>
                <li><Link to="/products?category=Ghee" className="hover:text-blue-400 transition-colors">Desi Bilona Cow Ghee</Link></li>
                <li><Link to="/products?category=Flavoured" className="hover:text-blue-400 transition-colors">Masala Buttermilk (Taak)</Link></li>
              </ul>
            </div>

            {/* Col 4: Contact Pune */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Pune Head Office</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-1" />
                  <span>Plot 42, Amarale Chowk, Paud Road, Kothrud, Pune - 411038</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>+91 98765 43210 / 020-25448900</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>care@amaraledairy.com</span>
                </li>
                <li className="flex items-center gap-2.5 text-xs text-slate-500">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Support: 6:00 AM - 9:00 PM Daily</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright and Policy Links */}
          <div className="pt-8 mt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 Amarale Dairy & Food Products Pvt. Ltd. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link to="/contact?tab=faq" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
              <Link to="/contact?tab=faq" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
              <Link to="/contact?tab=grievance" className="hover:text-slate-300 transition-colors">Grievance Officer</Link>
              <Link to="/contact?tab=track" className="hover:text-slate-300 transition-colors">Order Tracking</Link>
            </div>
            <p className="flex items-center gap-1 text-slate-400">
              Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> for Pune
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
