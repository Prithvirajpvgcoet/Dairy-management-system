import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Phone, Mail, MapPin, Clock, Search, 
  Menu, X, ShieldCheck, ChevronRight, User 
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
    <div className="min-h-screen flex flex-col bg-white text-slate-800 font-sans selection:bg-[#0B5ED7] selection:text-white">
      {/* ── Top Utility Bar (Mockup exact) ── */}
      <div className="bg-[#0B3B70] text-white text-xs py-2 px-4 border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-center md:text-left flex-wrap justify-center text-[12px] font-medium text-blue-100">
            <span>Fresh dairy, delivered to your doorstep, every day</span>
            <span className="text-blue-300">|</span>
            <span className="text-white font-semibold">Serving Pune</span>
            <span className="text-blue-300">|</span>
            <span className="text-amber-300 font-bold">Since 1976</span>
          </div>
          <div className="flex items-center gap-6 text-[12px] text-blue-200">
            <Link to="/contact?tab=track" className="hover:text-white transition-colors">
              Track Order
            </Link>
            <span className="text-blue-400">|</span>
            <Link to="/contact?tab=locator" className="hover:text-white transition-colors">
              Store Locator
            </Link>
            <span className="text-blue-400">|</span>
            <Link to="/contact?tab=faq" className="hover:text-white transition-colors">
              Help & Support
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Navigation Header (Mockup exact) ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Seal Logo & Typography */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full border-2 border-[#0B5ED7] p-1 flex items-center justify-center bg-blue-50/50 shadow-xs group-hover:scale-105 transition-transform">
              <span className="text-2xl font-black text-[#0B5ED7]">अ</span>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black tracking-tight text-[#0B3B70]">
                  अमराळे
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Dairy Farm
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest -mt-1">
                Since 1976 • Pune
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-semibold transition-colors pb-1 relative ${
                    active
                      ? 'text-[#0B5ED7] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0B5ED7]'
                      : 'text-slate-600 hover:text-[#0B5ED7]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/products"
              title="Search Products"
              className="p-2 text-slate-500 hover:text-[#0B5ED7] rounded-full hover:bg-slate-100 transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>

            {user ? (
              <Link
                to={user.role === 'ADMIN' ? '/admin' : user.role === 'DELIVERY_BOY' ? '/delivery' : '/customer'}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0B5ED7] font-bold text-sm border border-blue-200 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Dashboard ({user.name.split(' ')[0]})</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Customer Login
                </Link>
                <Link
                  to="/login?role=admin"
                  className="px-4 py-2 rounded-xl bg-[#0B5ED7] hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all"
                >
                  Admin Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white px-5 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2">
            <div className="space-y-1 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-bold ${
                    isActive(link.href)
                      ? 'bg-blue-50 text-[#0B5ED7]'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#0B5ED7]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-700"
              >
                Customer Login
              </Link>
              <Link
                to="/login?role=admin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-[#0B5ED7] text-white text-sm font-bold shadow-sm"
              >
                Admin Login
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1">
        {children}
      </main>

      {/* ── Mockup-Matched Dark-Blue Footer with Milk Wave ── */}
      <footer className="relative bg-[#092B54] text-white pt-16 pb-10 overflow-hidden">
        {/* Milk Wave Graphic along top border */}
        <div className="absolute top-0 left-0 right-0 h-6 overflow-hidden leading-none pointer-events-none">
          <svg className="w-full h-full text-white fill-current" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,-20 1200,30 L1200,0 L0,0 Z"></path>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            
            {/* Col 1: Brand & Tagline */}
            <div className="lg:col-span-1 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full border border-blue-400/40 p-1 flex items-center justify-center bg-white/10 text-white font-black text-xl">
                  अ
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight text-white">अमराळे</h3>
                  <p className="text-[10px] text-blue-200 uppercase font-semibold">Dairy Farm • Since 1976</p>
                </div>
              </div>
              <p className="text-xs text-blue-100/80 leading-relaxed font-medium">
                Purity, Trust & Taste in Every Drop.
              </p>
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

            {/* Col 3: Our Products */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Our Products</h4>
              <ul className="space-y-2 text-xs text-blue-200">
                <li><Link to="/products?category=Milk" className="hover:text-white transition-colors">Cow Milk</Link></li>
                <li><Link to="/products?category=Milk" className="hover:text-white transition-colors">Buffalo Milk</Link></li>
                <li><Link to="/products?category=Curd%20and%20Yogurt" className="hover:text-white transition-colors">Curd</Link></li>
                <li><Link to="/products?category=Paneer" className="hover:text-white transition-colors">Paneer</Link></li>
                <li><Link to="/products?category=Ghee" className="hover:text-white transition-colors">Ghee</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">More Products</Link></li>
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

            {/* Col 5: Follow Us & Download App */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2">Follow Us</h4>
              <div className="flex items-center gap-2">
                <a href="#facebook" className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#0B5ED7] flex items-center justify-center text-white transition-colors text-xs">
                  f
                </a>
                <a href="#instagram" className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#0B5ED7] flex items-center justify-center text-white transition-colors text-xs">
                  📸
                </a>
                <a href="#whatsapp" className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#0B5ED7] flex items-center justify-center text-white transition-colors text-xs">
                  💬
                </a>
              </div>

              <div className="pt-1">
                <h5 className="text-[11px] font-bold uppercase text-white mb-1.5">Download Our App</h5>
                <div className="space-y-1.5">
                  <div className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 flex items-center gap-2 cursor-pointer hover:bg-black/60 transition-colors w-fit">
                    <span className="text-base">▶</span>
                    <div>
                      <p className="text-[9px] text-slate-300 leading-none">GET IT ON</p>
                      <p className="text-[11px] font-bold text-white leading-tight">Google Play</p>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 flex items-center gap-2 cursor-pointer hover:bg-black/60 transition-colors w-fit">
                    <span className="text-base"></span>
                    <div>
                      <p className="text-[9px] text-slate-300 leading-none">Download on the</p>
                      <p className="text-[11px] font-bold text-white leading-tight">App Store</p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="font-serif italic text-blue-300 text-xs pt-1">
                A Healthier Tomorrow Together ♡
              </p>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-blue-300">
            <p>© 2026 Amarale Dairy Farms. All Rights Reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/contact?tab=faq" className="hover:text-white transition-colors">Privacy Policy</Link>
              <span>•</span>
              <Link to="/contact?tab=faq" className="hover:text-white transition-colors">Terms & Conditions</Link>
              <span>•</span>
              <Link to="/contact?tab=grievance" className="hover:text-white transition-colors">Refund Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
