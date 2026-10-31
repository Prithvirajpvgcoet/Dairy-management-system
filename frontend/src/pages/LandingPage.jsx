import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, User, ShoppingCart, ShieldCheck, Leaf, Clock,
  Truck, Smartphone, CheckCircle2, Plus, ArrowRight, Menu, X, Play
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
  { id: 3, name: 'Curd', unit: '500g', price_per_unit: 45, icon: '🥣' },
  { id: 4, name: 'Paneer', unit: '200g', price_per_unit: 110, icon: '🧀' },
  { id: 5, name: 'Ghee', unit: '250g', price_per_unit: 120, icon: '🍯' },
];

const PLANS = [
  { id: 1, name: 'Daily', desc: 'Fresh milk every day', price: '₹52', per: '/day', popular: false },
  { id: 2, name: 'Alternate Day', desc: 'Fresh milk on alternate days', price: '₹36', per: '/day', popular: false },
  { id: 3, name: 'Weekly', desc: '7 days subscription', price: '₹350', per: '/week', popular: true },
  { id: 4, name: 'Monthly', desc: '30 days subscription', price: '₹1,350', per: '/month', popular: false },
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
      .then(res => setProducts(res.data || DEFAULT_PRODUCTS))
      .catch(() => setProducts(DEFAULT_PRODUCTS));
  }, []);

  const handleAddToCart = (id) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-white font-['Poppins'] selection:bg-[#0D47A1] selection:text-white">
      
      {/* ─── NAVBAR ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-3' : 'bg-white py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-shadow border border-gray-100">
              <img src="/images/logo.jpg" alt="Amarale Logo" className="w-full h-full object-cover" />
            </div>
            <div className="text-2xl font-extrabold text-[#0D47A1] tracking-tight">
              अमराळे
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8 text-sm font-semibold text-gray-600">
            <Link to="/" className="text-[#0D47A1]">Home</Link>
            <a href="#products" className="hover:text-[#0D47A1] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-[#0D47A1] after:transition-all after:duration-300">Products</a>
            <a href="#subscription" className="hover:text-[#0D47A1] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-[#0D47A1] after:transition-all after:duration-300">Subscription</a>
            <a href="#about" className="hover:text-[#0D47A1] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-[#0D47A1] after:transition-all after:duration-300">About Us</a>
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
            <Link to="/login" className="text-gray-500 hover:text-[#0D47A1] hidden sm:block transition-colors"><User className="w-5 h-5" /></Link>
            <Link to="/login" className="bg-[#0D47A1] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-blue-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 hidden sm:block">
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
          <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="bg-[#0D47A1] text-white py-3 rounded-xl text-center shadow-md">Login to your account</Link>
        </div>
      </div>

      {/* ─── HERO ─── */}
      <section ref={heroRef} className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center relative z-10">
          
          {/* Left Text */}
          <div className={`w-full md:w-1/2 z-20 mb-12 md:mb-0 transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <div className="inline-flex items-center gap-2 bg-blue-100/80 backdrop-blur-sm text-[#0D47A1] text-xs font-bold px-4 py-1.5 rounded-full mb-6 border border-blue-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0D47A1]"></span>
              </span>
              Fresh from Farm to Home
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight">
              Premium Milk,<br />
              <span className="text-[#0D47A1] relative inline-block mt-2">
                Delivered Daily
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-blue-200 opacity-70" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="transparent"/></svg>
              </span>
            </h1>
            <p className="text-gray-500 text-lg mb-8 max-w-md font-medium leading-relaxed">
              Experience the purity of traditional dairy. No preservatives, completely natural, delivered right to your doorstep before 7 AM.
            </p>

            <div className="flex flex-wrap gap-4 items-center">
              <Link to="/login" className="relative group overflow-hidden bg-[#0D47A1] text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-blue-900/30 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-2">
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                Start Subscription <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#about" className="flex items-center gap-2 text-gray-700 font-bold hover:text-[#0D47A1] transition-colors">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group hover:bg-blue-100 transition-colors">
                  <Play className="w-4 h-4 ml-1 text-gray-600 group-hover:text-[#0D47A1]" />
                </div>
                How it works
              </a>
            </div>

            <div className="mt-12 flex items-center gap-8 border-t border-gray-100 pt-8">
              <div className="flex -space-x-3">
                {[1,2,3,4].map((i) => (
                  <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-blue-${i*100} flex items-center justify-center overflow-hidden shadow-sm`}>
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[1,2,3,4,5].map((i) => <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                </div>
                <p className="text-sm font-bold text-gray-800">Trusted by 10L+ Families</p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className={`w-full md:w-1/2 relative transition-all duration-1000 delay-300 ${heroVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-200/30 rounded-full blur-3xl -z-10"></div>
            
            <img
              src="/images/product2.png"
              alt="Amarale Premium Milk Splash"
              className="w-full h-auto max-w-[600px] mx-auto drop-shadow-2xl animate-[float_6s_ease-in-out_infinite]"
            />
            
            {/* Floating Badges */}
            <div className="absolute top-10 right-0 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-white/50 animate-[float_5s_ease-in-out_infinite_1s]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Quality</p>
                  <p className="text-sm font-extrabold text-gray-800">100% Pure</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-20 left-0 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-white/50 animate-[float_7s_ease-in-out_infinite_2s]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0D47A1]/10 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-[#0D47A1]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Delivery</p>
                  <p className="text-sm font-extrabold text-gray-800">Before 7 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRODUCT GRID ─── */}
      <section id="products" ref={productsRef} className={`py-20 transition-all duration-1000 ${productsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-[#0D47A1] font-bold text-sm tracking-wider uppercase mb-2 block">Our Products</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Farm Fresh Goodness</h2>
            </div>
            <Link to="/login" className="group flex items-center text-[#0D47A1] font-bold text-sm hover:bg-blue-50 px-4 py-2 rounded-full transition-colors">
              Explore All <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {(products.length > 0 ? products : DEFAULT_PRODUCTS).map((product, idx) => (
              <div
                key={product.id}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                style={{ transitionDelay: `${idx * 50}ms` }}
              >
                <div className="relative bg-gradient-to-b from-blue-50 to-white pt-8 pb-4 px-4 flex items-center justify-center h-48">
                  <img
                    src={PRODUCT_IMAGES[product.name] || PRODUCT_IMAGES.default}
                    alt={product.name}
                    className="w-32 h-auto object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-md"
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                  <div className="hidden items-center justify-center text-6xl drop-shadow-md">{product.icon || '🥛'}</div>
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-extrabold text-gray-900 text-lg">{product.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 font-medium mb-4">{product.unit || '1 unit'}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold text-[#0D47A1]">₹{product.price_per_unit || product.price}</span>
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      className="w-10 h-10 rounded-full bg-blue-50 text-[#0D47A1] hover:bg-[#0D47A1] hover:text-white flex items-center justify-center transition-colors active:scale-95"
                    >
                      {cart[product.id] ? <CheckCircle2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SUBSCRIPTION PLANS ─── */}
      <section id="subscription" ref={plansRef} className={`py-24 bg-[#0D47A1] relative overflow-hidden transition-all duration-1000 ${plansVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Flexible Subscriptions</h2>
            <p className="text-blue-100 font-medium text-lg max-w-2xl mx-auto">Pause, resume, or modify your milk delivery anytime. Save more with our monthly plans.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PLANS.map((plan, idx) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 ${
                  plan.popular ? 'ring-4 ring-blue-300 shadow-2xl scale-105 z-10' : 'shadow-xl'
                }`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-[#0D47A1] text-white text-xs font-bold uppercase tracking-widest px-6 py-1.5 rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}

                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-500 font-medium mb-6 h-10">{plan.desc}</p>

                <div className="mb-8 flex items-baseline">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 font-medium ml-1">{plan.per}</span>
                </div>

                <Link
                  to="/login"
                  className={`block w-full text-center font-bold py-3.5 rounded-xl transition-all ${
                    plan.popular
                      ? 'bg-[#0D47A1] text-white hover:bg-blue-800 shadow-lg shadow-blue-900/20'
                      : 'bg-blue-50 text-[#0D47A1] hover:bg-blue-100'
                  }`}
                >
                  Choose Plan
                </Link>
                
                <ul className="mt-6 space-y-3">
                  {['Free Doorstep Delivery', 'No hidden charges', 'Pause anytime'].map((feature, i) => (
                     <li key={i} className="flex items-center text-sm font-medium text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 shrink-0" />
                        {feature}
                     </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="about" ref={stepsRef} className={`py-24 bg-slate-50 transition-all duration-1000 ${stepsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#0D47A1] font-bold text-sm tracking-wider uppercase mb-2 block">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">4 Steps to Freshness</h2>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 z-0" />

            {[
              { icon: Smartphone, label: 'Subscribe', desc: 'Choose your products and set a schedule.', step: 1 },
              { icon: Leaf, label: 'Farm Fresh', desc: 'Sourced directly from our pure farms.', step: 2 },
              { icon: Truck, label: 'Dispatch', desc: 'Our delivery partners start early morning.', step: 3 },
              { icon: Clock, label: 'Delivered', desc: 'Fresh milk at your door before 7 AM.', step: 4 },
            ].map(({ icon: Icon, label, desc, step }, idx) => (
              <div key={step} className="relative z-10 flex flex-col items-center text-center group" style={{ transitionDelay: `${idx * 150}ms` }}>
                <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-blue-900/5 border border-gray-100 group-hover:-translate-y-2 group-hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <Icon className="w-10 h-10 text-[#0D47A1] relative z-10" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#0D47A1] text-white text-sm font-extrabold rounded-full flex items-center justify-center shadow-md">
                    {step}
                  </div>
                </div>
                <h4 className="font-extrabold text-gray-900 text-lg mb-2">{label}</h4>
                <p className="text-sm text-gray-500 font-medium">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-gray-900 pt-16 pb-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 border-b border-gray-800 pb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-white">
                  <img src="/images/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-3xl font-extrabold text-white">अमराळे</span>
              </div>
              <p className="text-gray-400 font-medium max-w-sm mb-6 leading-relaxed">
                Bringing the purity of traditional dairy farming straight to your home. Pure, natural, and fresh every morning.
              </p>
              <div className="flex gap-4">
                {/* Social icons placeholders */}
                {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full bg-gray-800 hover:bg-[#0D47A1] transition-colors flex items-center justify-center text-white cursor-pointer"><User className="w-4 h-4"/></div>)}
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Quick Links</h4>
              <ul className="space-y-3 font-medium text-gray-400">
                <li><a href="#products" className="hover:text-white transition-colors">Our Products</a></li>
                <li><a href="#subscription" className="hover:text-white transition-colors">Subscriptions</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">How it works</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">My Account</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Contact Us</h4>
              <ul className="space-y-3 font-medium text-gray-400">
                <li>support@amarale.com</li>
                <li>+91 98765 43210</li>
                <li>Pune, Maharashtra</li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between text-gray-500 text-sm font-medium">
            <p>© 2026 Amarale Dairy Farms. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Global styles for custom animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
};

export default LandingPage;
