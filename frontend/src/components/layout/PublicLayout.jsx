import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Phone, Mail, MapPin, Clock, Search, 
  Menu, X, ShieldCheck, ChevronRight, User, ShoppingCart
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
    <div className="min-h-screen flex flex-col bg-white text-slate-800 font-sans selection:bg-[#1551b5] selection:text-white">
      {/* ─── Top Utility Bar (Image 1 Exact) ─── */}
      <div className="bg-[#0A2540] text-white text-xs py-2 px-4 border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-center md:text-left flex-wrap justify-center text-[12px] font-medium text-blue-100">
            <span>Fresh dairy, delivered to your doorstep, every day</span>
            <span className="text-blue-300/60">|</span>
            <span className="text-white font-semibold">Serving Pune</span>
            <span className="text-blue-300/60">|</span>
            <span className="bg-[#F5A623] text-[#0A2540] font-black px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">
              Since 1976
            </span>
          </div>
          <div className="flex items-center gap-5 text-[12px] text-blue-200">
            <Link to="/contact?tab=track" className="hover:text-white transition-colors">
              Track Order
            </Link>
            <span className="text-blue-400/60">|</span>
            <Link to="/contact?tab=locator" className="hover:text-white transition-colors">
              Store Locator
            </Link>
            <span className="text-blue-400/60">|</span>
            <Link to="/contact?tab=faq" className="hover:text-white transition-colors">
              Help & Support
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Main Navigation Header (Image 1 Exact) ─── */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Typography */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-11 h-11 rounded-full border-2 border-[#1551b5] flex items-center justify-center bg-blue-50 shadow-xs group-hover:scale-105 transition-transform">
              <span className="text-2xl font-black text-[#1551b5]">अ</span>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black tracking-tight text-[#0A2540]">
                  अमराळे
                </span>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Dairy Farm
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest -mt-1">
                Since 1976 · Pune
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-6">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-semibold transition-colors pb-1 relative whitespace-nowrap ${
                    active
                      ? 'text-[#1551b5] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#1551b5]'
                      : 'text-slate-600 hover:text-[#1551b5]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons (Image 1 Exact: Search + Customer Login + Admin Login) */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <Link
              to="/products"
              title="Search Products"
              className="p-2 text-slate-500 hover:text-[#1551b5] rounded-full hover:bg-slate-100 transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>

            <Link
              to="/login?role=customer"
              className="px-5 py-2 text-xs sm:text-sm font-bold text-[#1551b5] border-2 border-[#1551b5] rounded-full hover:bg-blue-50 transition-all active:scale-95 whitespace-nowrap"
            >
              Customer Login
            </Link>

            <Link
              to="/login?role=admin"
              className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#1551b5] hover:bg-blue-800 rounded-full transition-all shadow-sm hover:shadow-md active:scale-95 whitespace-nowrap"
            >
              Admin Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex xl:hidden items-center gap-2">
            <Link
              to="/login?role=customer"
              className="px-3.5 py-1.5 text-xs font-bold text-[#1551b5] border border-[#1551b5] rounded-full hover:bg-blue-50 sm:hidden"
            >
              Login
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
                    isActive(link.href)
                      ? 'bg-blue-50 text-[#1551b5] font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login?role=customer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-full border-2 border-[#1551b5] text-[#1551b5] text-xs font-bold hover:bg-blue-50"
              >
                Customer Login
              </Link>
              <Link
                to="/login?role=admin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-full bg-[#1551b5] text-white text-xs font-bold hover:bg-blue-800 shadow-sm"
              >
                Admin Login
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {children}
      </main>

      {/* ─── Footer ─── */}
      <footer className="bg-[#0A2540] text-white pt-14 pb-8 border-t border-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10">
            
            {/* Col 1: Brand Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-white/80 flex items-center justify-center bg-white/10">
                  <span className="text-xl font-black text-white">अ</span>
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight text-white">अमराळे</h3>
                  <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">
                    Purity, Trust & Taste · Since 1976
                  </p>
                </div>
              </div>
              <p className="text-xs text-blue-200/90 leading-relaxed max-w-sm">
                Rooted in traditional dairy farming values since 1976. Delivering farm-fresh pure cow and buffalo milk directly to Pune families before 7:00 AM every morning.
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Preservative-Free · Lab Tested Daily</span>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Quick Links</h4>
              <ul className="space-y-2 text-xs text-blue-200">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">Our Products</Link></li>
                <li><Link to="/subscriptions" className="hover:text-white transition-colors">Subscriptions</Link></li>
                <li><Link to="/our-story" className="hover:text-white transition-colors">Our Story</Link></li>
                <li><Link to="/quality" className="hover:text-white transition-colors">Quality & Infrastructure</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            {/* Col 3: Popular Products */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Our Products</h4>
              <ul className="space-y-2 text-xs text-blue-200">
                <li><Link to="/products" className="hover:text-white transition-colors">Cow Milk (A2)</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">Buffalo Milk</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">Natural Curd</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">Malai Paneer</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">Pure Desi Ghee</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">Fresh Butter</Link></li>
              </ul>
            </div>

            {/* Col 4: Contact Us */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Contact Us</h4>
              <ul className="space-y-2 text-xs text-blue-200">
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                  <span>+91 98765 43210</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                  <span>care@amaraledairy.com</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-300 shrink-0 mt-0.5" />
                  <span>Pune, Maharashtra, India</span>
                </li>
                <li className="flex items-center gap-2 text-blue-300 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                  <span>Mon - Sun: 6:00 AM - 9:00 PM</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-blue-300">
            <p>© 2026 Amarale Dairy Farms. All Rights Reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/contact?tab=faq" className="hover:text-white transition-colors">Privacy Policy</Link>
              <span>·</span>
              <Link to="/contact?tab=faq" className="hover:text-white transition-colors">Terms & Conditions</Link>
              <span>·</span>
              <Link to="/contact?tab=grievance" className="hover:text-white transition-colors">Refund Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
