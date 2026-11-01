import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Leaf, Clock, User, ArrowRight, Plus, 
  CheckCircle2, Check, Smartphone, Truck, Star
} from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import api from '../api/client';
import toast from 'react-hot-toast';

const PRODUCT_IMAGES = {
  'Cow Milk': '/images/product1.png',
  'Buffalo Milk': '/images/product2.png',
  'Curd': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=300&fit=crop',
  'Paneer': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&h=300&fit=crop',
  'Ghee': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&h=300&fit=crop',
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

export default function LandingPage() {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [cart, setCart] = useState({});

  useEffect(() => {
    api.get('/products')
      .then(res => {
        if (res.data && res.data.length > 0) {
          setProducts(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleAddToCart = (product) => {
    setCart(prev => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }));
    toast.success(`Added ${product.name} to cart!`);
  };

  return (
    <PublicLayout>
      {/* ─── 1. HERO SECTION (Image 2 Exact Mockup) ─── */}
      <section className="relative bg-gradient-to-br from-[#F5F8FE] via-white to-[#F0F5FD] py-12 lg:py-20 overflow-hidden border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Copy + Badges + CTAs */}
            <div className="lg:col-span-7 space-y-4 text-left">
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.12]">
                Farm Fresh Milk <br />
                <span className="text-[#1551b5]">Delivered Daily</span>
              </h1>

              <p className="text-gray-900 font-extrabold text-lg sm:text-xl pt-1">
                Pure. Natural. Healthy.
              </p>

              <p className="text-slate-600 font-medium text-sm sm:text-base max-w-lg leading-relaxed">
                From our farm to your home, before 7 AM every morning.
              </p>

              {/* Badges (Image 2 Style) */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <span className="inline-flex items-center gap-2 bg-[#F0F5FD] border border-blue-200/80 text-[#1551b5] text-xs sm:text-sm font-bold px-4 py-2 rounded-full shadow-2xs">
                  <Leaf className="w-4 h-4 text-emerald-600" /> 100% Pure & Natural
                </span>
                <span className="inline-flex items-center gap-2 bg-[#F0F5FD] border border-blue-200/80 text-[#1551b5] text-xs sm:text-sm font-bold px-4 py-2 rounded-full shadow-2xs">
                  <ShieldCheck className="w-4 h-4 text-[#1551b5]" /> No Preservatives
                </span>
                <span className="inline-flex items-center gap-2 bg-[#F0F5FD] border border-blue-200/80 text-[#1551b5] text-xs sm:text-sm font-bold px-4 py-2 rounded-full shadow-2xs">
                  <Clock className="w-4 h-4 text-blue-600" /> Delivered Before 7 AM
                </span>
              </div>

              {/* Action Buttons (Image 2 Style) */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  to="/login?role=customer"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1551b5] hover:bg-blue-800 text-white rounded-full font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                  Start Subscription <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#products"
                  className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-slate-300 text-slate-800 hover:border-[#1551b5] hover:text-[#1551b5] rounded-full font-bold text-sm sm:text-base transition-all bg-white shadow-2xs"
                >
                  Shop Now
                </a>
              </div>
            </div>

            {/* Right Column: Branded Milk Splashes Card (Image 2) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[480px] rounded-2xl overflow-hidden border border-slate-200/80 shadow-xl bg-white p-3 hover:shadow-2xl transition-all duration-300">
                <img
                  src="/images/hero_card_banner.png"
                  alt="Amarale Premium Dairy Splash - Milk, Glass, Curd"
                  className="w-full h-auto object-contain rounded-xl transform hover:scale-[1.02] transition-transform duration-500"
                  onError={(e) => { e.target.src = '/images/hero-composition.png'; }}
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 2. SHOP OUR PRODUCTS ─── */}
      <section id="products" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Shop Our Products</h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">Directly sourced, bottled fresh within hours</p>
            </div>
            <Link to="/products" className="text-[#1551b5] font-bold text-xs sm:text-sm hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {products.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="bg-gradient-to-b from-blue-50/60 to-white rounded-xl p-4 flex items-center justify-center h-44 mb-3">
                  <img
                    src={product.image_url || PRODUCT_IMAGES[product.name] || PRODUCT_IMAGES.default}
                    alt={product.name}
                    className="max-h-36 w-auto object-contain drop-shadow"
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                  <div className="hidden items-center justify-center text-5xl">{product.icon || '🥛'}</div>
                </div>

                <div>
                  <h3 className="font-black text-gray-900 text-base">{product.name}</h3>
                  <p className="text-xs text-slate-500 font-medium mb-3">{product.unit || '1 Litre'}</p>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-lg font-black text-gray-900">₹{product.price_per_unit || product.price || 52}</span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="px-3.5 py-1.5 rounded-full bg-[#1551b5] text-white hover:bg-blue-800 text-xs font-bold flex items-center gap-1 transition-colors active:scale-95 shadow-xs"
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

      {/* ─── 3. CHOOSE YOUR SUBSCRIPTION ─── */}
      <section id="subscription" className="py-16 sm:py-20 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Choose Your Subscription</h2>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">Save more with our flexible doorstep plans</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 border ${
                  plan.popular ? 'border-[#1551b5] shadow-xl ring-2 ring-blue-200' : 'border-slate-200 shadow-sm'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1551b5] text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-0.5 rounded-full shadow">
                    Most Popular
                  </div>
                )}

                <h3 className="text-xl font-black text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-xs text-slate-500 font-medium mb-6 h-8">{plan.desc}</p>

                <div className="mb-6 flex items-baseline">
                  <span className="text-3xl font-black text-gray-900">{plan.price}</span>
                  <span className="text-xs text-slate-500 font-semibold ml-1">{plan.per}</span>
                </div>

                <Link
                  to="/login?role=customer"
                  className={`block w-full text-center font-bold text-xs sm:text-sm py-2.5 rounded-full transition-all ${
                    plan.popular
                      ? 'bg-[#1551b5] text-white hover:bg-blue-800 shadow-md'
                      : 'bg-blue-50 text-[#1551b5] hover:bg-blue-100'
                  }`}
                >
                  Choose Plan
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. HOW IT WORKS ─── */}
      <section id="about" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">How It Works</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">4 simple steps to fresh morning deliveries</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: 1, label: 'Place Your Order', desc: 'Choose products and select your subscription frequency.' },
              { num: 2, label: 'We Collect Fresh', desc: 'Milk is collected directly from local farms every afternoon.' },
              { num: 3, label: 'Out for Delivery', desc: 'Chilled delivery partners depart before the crack of dawn.' },
              { num: 4, label: 'Delivered Before 7 AM', desc: 'Placed silently at your doorstep before you wake up.' },
            ].map((step) => (
              <div key={step.num} className="flex flex-col items-start bg-slate-50/70 p-6 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-[#1551b5] text-white font-black text-sm flex items-center justify-center mb-4 shadow-sm">
                  {step.num}
                </div>
                <h4 className="font-black text-gray-900 text-base mb-1">{step.label}</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. BOTTOM TRUST BAR ─── */}
      <section className="bg-blue-50/50 py-10 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#1551b5]">
              <Leaf className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h5 className="font-black text-gray-900 text-sm">Pure & Natural</h5>
              <p className="text-xs text-slate-500">100% farm fresh</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#1551b5]">
              <ShieldCheck className="w-6 h-6 text-[#1551b5]" />
            </div>
            <div>
              <h5 className="font-black text-gray-900 text-sm">No Preservatives</h5>
              <p className="text-xs text-slate-500">Only natural dairy</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#1551b5]">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h5 className="font-black text-gray-900 text-sm">On Time Delivery</h5>
              <p className="text-xs text-slate-500">Before 7 AM daily</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#1551b5]">
              <User className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h5 className="font-black text-gray-900 text-sm">Trusted by Families</h5>
              <p className="text-xs text-slate-500">10,000+ happy homes</p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
