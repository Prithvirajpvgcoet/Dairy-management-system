import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Phone, Mail, MapPin, Clock, Search, 
  Menu, X, ShieldCheck
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
    <div className="min-h-screen flex flex-col bg-white text-slate-800 font-sans selection:bg-[#0D47A1] selection:text-white">
      {/* ─── Top Utility Bar (Image 5 Exact) ─── */}
      <div className="bg-[#0A2540] text-white text-xs py-2 px-4 border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-center md:text-left flex-wrap justify-center text-[12px] font-medium text-blue-100">
            <span>Fresh dairy, delivered to your doorstep, every day!</span>
            <span className="text-blue-300/60">|</span>
            <span className="text-white font-semibold">Serving Pune</span>
            <span className="text-blue-300/60">|</span>
            <span className="bg-[#F5A623] text-[#0A2540] font-black px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">
              Since 1976
            </span>
          </div>
          <div className="flex items-center gap-4 text-[12px] text-blue-200">
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

      {/* ─── Main Navigation Header (Image 5 Exact) ─── */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Typography */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-11 h-11 rounded-full border-2 border-[#0D47A1] flex items-center justify-center bg-blue-50 shadow-xs group-hover:scale-105 transition-transform">
              <span className="text-2xl font-black text-[#0D47A1]">अ</span>
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
                      ? 'text-[#0D47A1] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0D47A1]'
                      : 'text-slate-600 hover:text-[#0D47A1]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons: Search + Customer Login + Admin Login */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <Link
              to="/products"
              title="Search Products"
              className="p-2 text-slate-500 hover:text-[#0D47A1] rounded-full hover:bg-slate-100 transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>

            <Link
              to="/login?role=customer"
              className="px-5 py-2 text-xs sm:text-sm font-bold text-[#0D47A1] border-2 border-[#0D47A1] rounded-full hover:bg-blue-50 transition-all active:scale-95 whitespace-nowrap"
            >
              Customer Login
            </Link>

            <Link
              to="/login?role=admin"
              className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#0D47A1] hover:bg-blue-800 rounded-full transition-all shadow-sm hover:shadow-md active:scale-95 whitespace-nowrap"
            >
              Admin Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex xl:hidden items-center gap-2">
            <Link
              to="/login?role=customer"
              className="px-3.5 py-1.5 text-xs font-bold text-[#0D47A1] border border-[#0D47A1] rounded-full hover:bg-blue-50 sm:hidden"
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
                      ? 'bg-blue-50 text-[#0D47A1] font-bold'
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
                className="w-full text-center py-2.5 rounded-full border-2 border-[#0D47A1] text-[#0D47A1] text-xs font-bold hover:bg-blue-50"
              >
                Customer Login
              </Link>
              <Link
                to="/login?role=admin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-full bg-[#0D47A1] text-white text-xs font-bold hover:bg-blue-800 shadow-sm"
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

      {/* ─── 5-Column Footer (Image 5 Exact) ─── */}
      <footer className="bg-[#0A2540] text-white pt-14 pb-8 border-t border-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10">
            
            {/* Col 1: Brand Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-white/80 flex items-center justify-center bg-white/10">
                  <span className="text-xl font-black text-white">अ</span>
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight text-white">अमराळे</h3>
                  <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">
                    Dairy Farm
                  </p>
                </div>
              </div>
              <p className="text-xs text-blue-200/90 leading-relaxed">
                Purity, Trust & Taste In Every Drop.
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium pt-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>100% Pure & Lab Tested</span>
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
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            {/* Col 3: Our Products (Image 5 exact list) */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Our Products</h4>
              <ul className="space-y-2 text-xs text-blue-200">
                <li><Link to="/products" className="hover:text-white transition-colors">Cow Milk</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">Buffalo Milk</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">Curd</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">Paneer</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">Ghee</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">Butter</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors text-blue-300 font-semibold">More Products →</Link></li>
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
                  <span>info@amraledairy.com</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-300 shrink-0 mt-0.5" />
                  <div>
                    <span>Pune, Maharashtra</span>
                    <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="block text-[11px] text-blue-300 underline hover:text-white">
                      Find on Google Maps
                    </a>
                  </div>
                </li>
                <li className="flex items-center gap-2 text-blue-300 text-[11px] pt-1">
                  <Clock className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                  <span>Mon - Sun: 6:00 AM - 9:00 PM</span>
                </li>
              </ul>
            </div>

            {/* Col 5: Follow Us & Download App (Image 5 exact) */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Follow Us</h4>
                <div className="flex items-center gap-2">
                  {['f', 'ig', 'yt', 'wa'].map((s, idx) => (
                    <span
                      key={idx}
                      className="w-8 h-8 rounded-full bg-blue-600/60 hover:bg-blue-600 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
                    >
                      {s === 'f' ? 'f' : s === 'ig' ? '📸' : s === 'yt' ? '▶' : '💬'}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2">Download Our App</h4>
                <div className="flex flex-col gap-2">
                  <div className="bg-black/80 hover:bg-black text-white px-3 py-1.5 rounded-lg border border-white/20 flex items-center gap-2 cursor-pointer transition-all">
                    <span className="text-lg">▶</span>
                    <div>
                      <p className="text-[9px] uppercase leading-none text-slate-300">GET IT ON</p>
                      <p className="text-xs font-bold leading-tight">Google Play</p>
                    </div>
                  </div>
                  <div className="bg-black/80 hover:bg-black text-white px-3 py-1.5 rounded-lg border border-white/20 flex items-center gap-2 cursor-pointer transition-all">
                    <span className="text-lg"></span>
                    <div>
                      <p className="text-[9px] uppercase leading-none text-slate-300">Download on the</p>
                      <p className="text-xs font-bold leading-tight">App Store</p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="italic text-xs text-blue-200/90 font-medium pt-1">
                A Healthier Tomorrow Together ♡
              </p>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-blue-300">
            <p>© 2025 Amarale Dairy Farms. All Rights Reserved.</p>
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
