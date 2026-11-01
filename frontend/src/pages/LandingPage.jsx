import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, User, ShoppingCart, ShieldCheck, Leaf, Clock,
  Truck, Smartphone, CheckCircle2, Plus, ArrowRight, Menu, X, Check
} from 'lucide-react';
import api from '../api/client';

// Scroll reveal hook for animations
const useScrollReveal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
};

const PRODUCT_IMAGES = {
  'Cow Milk': '/images/product1.png',
  'Buffalo Milk': '/images/product2.png',
  'Curd': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop',
  'Paneer': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&h=200&fit=crop',
  'Ghee': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200&h=200&fit=crop',
  default: '/images/product3.png',
};

const DEFAULT_PRODUCTS = [
  { id: 1, name: 'Cow Milk', unit: '1 Litre', price_per_unit: 52, icon: '🥛' },
  { id: 2, name: 'Buffalo Milk', unit: '1 Litre', price_per_unit: 60, icon: '🥛' },
  { id: 3, name: 'Curd', unit: '500 g', price_per_unit: 45, icon: '🥣' },
  { id: 4, name: 'Paneer', unit: '200 g', price_per_unit: 110, icon: '🧀' },
  { id: 5, name: 'Ghee', unit: '200 g', price_per_unit: 120, icon: '🍯' },
];

const PLANS = [
  { id: 1, name: 'Daily', desc: 'Every day delivery', price: '₹52', per: '/day', popular: false },
  { id: 2, name: 'Alternate Day', desc: 'On alternate days', price: '₹36', per: '/delivery', popular: false },
  { id: 3, name: 'Weekly', desc: '7 days delivery', price: '₹350', per: '/week', popular: true },
  { id: 4, name: 'Monthly', desc: '30 days delivery', price: '₹1,350', per: '/month', popular: false },
];

const LandingPage = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Animation hooks for different sections
  const [heroRef, heroVisible] = useScrollReveal();
  const [productsRef, productsVisible] = useScrollReveal();
  const [plansRef, plansVisible] = useScrollReveal();
  const [stepsRef, stepsVisible] = useScrollReveal();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    api.get('/products')
      .then(res => setProducts(res.data && res.data.length > 0 ? res.data : DEFAULT_PRODUCTS))
      .catch(() => setProducts(DEFAULT_PRODUCTS));
  }, []);

  const handleAddToCart = (id) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-white font-['Poppins'] selection:bg-[#0D47A1] selection:text-white">
      
      {/* ─── NAVBAR ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-3' : 'bg-white py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow border border-gray-100">
              <img src="/images/logo.jpg" alt="Amarale Logo" className="w-full h-full object-cover" />
            </div>
            <div className="text-2xl font-black text-[#0D47A1] tracking-tight">
              अमराळे
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8 text-sm font-semibold text-gray-600">
            <Link to="/" className="text-[#0D47A1]">Home</Link>
            <a href="#products" className="hover:text-[#0D47A1] transition-colors">Products</a>
            <a href="#subscription" className="hover:text-[#0D47A1] transition-colors">Subscription</a>
            <a href="#about" className="hover:text-[#0D47A1] transition-colors">About Us</a>
            <Link to="/contact" className="hover:text-[#0D47A1] transition-colors">Contact Us</Link>
          </div>

          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-[#0D47A1] hidden sm:block transition-colors"><Search className="w-5 h-5" /></button>
            <Link to="/login" className="relative text-gray-500 hover:text-[#0D47A1] hidden sm:block transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/login" className="bg-[#0D47A1] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-blue-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95">
              Login
            </Link>
            <button className="md:hidden text-[#0D47A1]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`md:hidden fixed inset-0 z-40 bg-white pt-24 px-6 transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col space-y-6 text-lg font-bold text-gray-800">
          <a href="#products" onClick={() => setMobileMenuOpen(false)} className="border-b border-gray-100 pb-4">Products</a>
          <a href="#subscription" onClick={() => setMobileMenuOpen(false)} className="border-b border-gray-100 pb-4">Subscription</a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)} className="border-b border-gray-100 pb-4">About Us</a>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="border-b border-gray-100 pb-4">Contact Us</Link>
          <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="bg-[#0D47A1] text-white py-3 rounded-xl text-center shadow-md">Login to your account</Link>
        </div>
      </div>

      {/* ─── HERO ─── */}
      <section ref={heroRef} className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-gradient-to-br from-blue-50/60 via-white to-blue-50/40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center relative z-10">
          
          {/* Left Text */}
          <div className={`w-full md:w-1/2 z-20 mb-12 md:mb-0 transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 leading-[1.15] mb-4 tracking-tight">
              Farm Fresh Milk<br />
              <span className="text-[#0D47A1]">Delivered Daily</span>
            </h1>
            <p className="text-gray-700 font-bold text-lg mb-2">
              Pure. Natural. Healthy.
            </p>
            <p className="text-gray-500 text-base mb-6 max-w-md font-medium leading-relaxed">
              From our farm to your home, before 7 AM every morning.
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-4 mb-8 text-xs font-bold text-gray-700">
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-[#0D47A1] px-3.5 py-1.5 rounded-full border border-blue-100">
                <Leaf className="w-4 h-4 text-emerald-600" /> 100% Pure & Natural
              </span>
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-[#0D47A1] px-3.5 py-1.5 rounded-full border border-blue-100">
                <ShieldCheck className="w-4 h-4 text-[#0D47A1]" /> No Preservatives
              </span>
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-[#0D47A1] px-3.5 py-1.5 rounded-full border border-blue-100">
                <Clock className="w-4 h-4 text-blue-600" /> Delivered Before 7 AM
              </span>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <Link to="/login" className="bg-[#0D47A1] text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-blue-900/25 transition-all hover:bg-blue-800 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2">
                Start Subscription <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#products" className="px-8 py-3.5 rounded-full font-bold border-2 border-gray-300 text-gray-700 hover:border-[#0D47A1] hover:text-[#0D47A1] transition-all">
                Shop Now
              </a>
            </div>
          </div>

          {/* Right Image */}
          <div className={`w-full md:w-1/2 relative transition-all duration-1000 delay-300 ${heroVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-200/40 rounded-full blur-3xl -z-10"></div>
            
            <img
              src="/images/product2.png"
              alt="Farm Fresh Amarale Milk"
              className="w-full h-auto max-w-[540px] mx-auto drop-shadow-2xl animate-[float_6s_ease-in-out_infinite]"
              onError={(e) => { e.target.src = '/images/product1.png'; }}
            />
          </div>
        </div>
      </section>

      {/* ─── SHOP OUR PRODUCTS ─── */}
      <section id="products" ref={productsRef} className={`py-20 transition-all duration-1000 ${productsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Shop Our Products</h2>
            </div>
            <Link to="/login" className="text-[#0D47A1] font-bold text-sm hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {(products.length > 0 ? products : DEFAULT_PRODUCTS).slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="bg-gradient-to-b from-blue-50/60 to-white rounded-xl p-4 flex items-center justify-center h-44 mb-3">
                  <img
                    src={PRODUCT_IMAGES[product.name] || PRODUCT_IMAGES.default}
                    alt={product.name}
                    className="max-h-36 w-auto object-contain drop-shadow"
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                  <div className="hidden items-center justify-center text-5xl">{product.icon || '🥛'}</div>
                </div>

                <div>
                  <h3 className="font-black text-gray-900 text-base">{product.name}</h3>
                  <p className="text-xs text-gray-500 font-medium mb-3">{product.unit || '1 Litre'}</p>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-lg font-black text-gray-900">₹{product.price_per_unit || product.price || 52}</span>
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      className="px-3 py-1.5 rounded-full bg-[#0D47A1] text-white hover:bg-blue-800 text-xs font-bold flex items-center gap-1 transition-colors active:scale-95"
                    >
                      {cart[product.id] ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />} Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CHOOSE YOUR SUBSCRIPTION ─── */}
      <section id="subscription" ref={plansRef} className={`py-20 bg-slate-50 relative overflow-hidden transition-all duration-1000 ${plansVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="mb-12">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Choose Your Subscription</h2>
            <p className="text-gray-500 font-medium text-sm mt-1">Save more with our flexible plans</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 border ${
                  plan.popular ? 'border-[#0D47A1] shadow-xl ring-2 ring-blue-200' : 'border-gray-200 shadow-sm'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0D47A1] text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-0.5 rounded-full shadow">
                    Most Popular
                  </div>
                )}

                <h3 className="text-xl font-black text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-xs text-gray-500 font-medium mb-6 h-8">{plan.desc}</p>

                <div className="mb-6 flex items-baseline">
                  <span className="text-3xl font-black text-gray-900">{plan.price}</span>
                  <span className="text-xs text-gray-500 font-semibold ml-1">{plan.per}</span>
                </div>

                <Link
                  to="/login"
                  className={`block w-full text-center font-bold text-sm py-2.5 rounded-xl transition-all ${
                    plan.popular
                      ? 'bg-[#0D47A1] text-white hover:bg-blue-800 shadow'
                      : 'bg-blue-50 text-[#0D47A1] hover:bg-blue-100'
                  }`}
                >
                  Choose Plan
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="about" ref={stepsRef} className={`py-20 bg-white transition-all duration-1000 ${stepsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: 1, label: 'Place Your Order', desc: 'Choose products and select your plan' },
              { num: 2, label: 'We Collect Fresh', desc: 'Milk collected fresh from our farm' },
              { num: 3, label: 'Out for Delivery', desc: 'Our delivery partner is on the way' },
              { num: 4, label: 'Delivered Before 7 AM', desc: 'Right to your doorstep before 7 AM' },
            ].map((step) => (
              <div key={step.num} className="flex flex-col items-start">
                <div className="w-10 h-10 rounded-full bg-[#0D47A1] text-white font-black text-sm flex items-center justify-center mb-4 shadow">
                  {step.num}
                </div>
                <h4 className="font-black text-gray-900 text-base mb-1">{step.label}</h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM TRUST BAR ─── */}
      <section className="bg-blue-50/50 py-10 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#0D47A1]">
              <Leaf className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h5 className="font-black text-gray-900 text-sm">Pure & Natural</h5>
              <p className="text-xs text-gray-500">100% farm fresh</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#0D47A1]">
              <ShieldCheck className="w-6 h-6 text-[#0D47A1]" />
            </div>
            <div>
              <h5 className="font-black text-gray-900 text-sm">No Preservatives</h5>
              <p className="text-xs text-gray-500">Only natural products</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#0D47A1]">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h5 className="font-black text-gray-900 text-sm">On Time Delivery</h5>
              <p className="text-xs text-gray-500">Before 7 AM</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#0D47A1]">
              <User className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h5 className="font-black text-gray-900 text-sm">Trusted by Families</h5>
              <p className="text-xs text-gray-500">1L+ happy customers</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-gray-900 pt-16 pb-8 border-t border-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 border-b border-gray-800 pb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-white">
                  <img src="/images/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-3xl font-black text-white">अमराळे</span>
              </div>
              <p className="text-gray-400 font-medium max-w-sm mb-6 leading-relaxed text-sm">
                Bringing the purity of traditional dairy farming straight to your home. Pure, natural, and fresh every morning.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">Quick Links</h4>
              <ul className="space-y-3 font-medium text-gray-400 text-sm">
                <li><a href="#products" className="hover:text-white transition-colors">Our Products</a></li>
                <li><a href="#subscription" className="hover:text-white transition-colors">Subscriptions</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">How it works</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">My Account</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">Contact Us</h4>
              <ul className="space-y-3 font-medium text-gray-400 text-sm">
                <li>support@amarale.com</li>
                <li>+91 98765 43210</li>
                <li>Pune, Maharashtra</li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between text-gray-500 text-xs font-medium">
            <p>© 2026 Amarale Dairy Farms. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Animation keyframes */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
      `}} />
    </div>
  );
};

export default LandingPage;
