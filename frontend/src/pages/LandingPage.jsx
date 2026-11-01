import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Plus, Check, LayoutGrid, ShoppingCart,
  Heart, Home, Salad, Smile
} from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import api from '../api/client';
import toast from 'react-hot-toast';

const PRODUCT_IMAGES = {
  'Cow Milk': '/images/product1.png',
  'Buffalo Milk': '/images/product2.png',
  'Toned Milk': '/images/product1.png',
  'Double Toned Milk': '/images/product1.png',
  'Curd': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=300&fit=crop',
  'Paneer': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&h=300&fit=crop',
  'Ghee': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&h=300&fit=crop',
  'Butter': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&h=300&fit=crop',
  default: '/images/product3.png',
};

const POPULAR_PRODUCTS = [
  { id: 1, name: 'Cow Milk', unit: '1 L', price_per_unit: 52, icon: '🥛', image: '/images/product1.png' },
  { id: 2, name: 'Buffalo Milk', unit: '1 L', price_per_unit: 60, icon: '🥛', image: '/images/product2.png' },
  { id: 3, name: 'Curd', unit: '500 g', price_per_unit: 45, icon: '🥣', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=300&fit=crop' },
  { id: 4, name: 'Paneer', unit: '200 g', price_per_unit: 110, icon: '🧀', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&h=300&fit=crop' },
  { id: 5, name: 'Ghee', unit: '200 g', price_per_unit: 120, icon: '🍯', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&h=300&fit=crop' },
  { id: 6, name: 'Butter', unit: '200 g', price_per_unit: 90, icon: '🧈', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&h=300&fit=crop' },
];

export default function LandingPage() {
  const [products, setProducts] = useState(POPULAR_PRODUCTS);
  const [cart, setCart] = useState({});

  useEffect(() => {
    api.get('/products')
      .then(res => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          // Merge API data with default display to ensure 6 popular items are covered
          const merged = POPULAR_PRODUCTS.map(def => {
            const match = res.data.find(p => p.name?.toLowerCase() === def.name.toLowerCase());
            return match ? { ...def, ...match, price_per_unit: match.price_per_unit || match.price || def.price_per_unit } : def;
          });
          setProducts(merged);
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
      {/* ─── 1. HERO SECTION (Image 5 / Home Screen Exact) ─── */}
      <section className="relative bg-gradient-to-b from-[#F3F7FD] via-white to-white py-10 lg:py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Eyebrow + H1 + Subtitle + CTAs + 4 Trust Badges */}
            <div className="lg:col-span-7 space-y-5 text-left">
              
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">
                PURE DAIRY · HEALTHY FAMILIES · SINCE 1976
              </div>

              {/* H1 Headline: Image 5 Exact */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Purity, Trust & Taste <br />
                <span className="text-slate-900">in Every Drop.</span>
              </h1>

              {/* Body Text */}
              <p className="text-slate-600 font-normal text-sm sm:text-base max-w-xl leading-relaxed">
                We deliver pure and fresh milk & dairy products directly to your doorstep, every day.
              </p>

              {/* Call-to-Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  to="/subscriptions"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#0D47A1] hover:bg-blue-800 text-white rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                  Start Subscription <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-6 py-3.5 border border-slate-300 text-slate-800 hover:border-[#0D47A1] hover:text-[#0D47A1] rounded-full font-bold text-sm bg-white hover:bg-slate-50 transition-all shadow-2xs"
                >
                  <LayoutGrid className="w-4 h-4 text-slate-600" /> Explore Products
                </Link>
              </div>

              {/* 4-Pillar Trust Indicators (Image 5 Row) */}
              <div className="pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-start gap-2.5">
                  <span className="text-xl">🌿</span>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">100% Natural</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">No preservatives</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-xl">❤️</span>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">Trusted by</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">Thousands of Families</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-xl">🏠</span>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">Hygienic & Safe</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">From farm to home</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-xl">🚚</span>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">On-time Delivery</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">Everyday</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Hero Dairy Composition + Handwritten Callout */}
            <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
              
              {/* Handwritten Note Callout Top-Right */}
              <div className="w-full flex justify-end mb-2 pr-4">
                <div className="text-right">
                  <span className="font-['Caveat',cursive,sans-serif] italic text-base sm:text-lg font-bold text-[#0D47A1] drop-shadow-xs">
                    Goodness from Our Farms to Your Home ♡
                  </span>
                </div>
              </div>

              {/* Visual Card Composition */}
              <div className="relative w-full max-w-[460px] rounded-3xl overflow-hidden bg-gradient-to-tr from-blue-100/70 via-blue-50/40 to-white p-4 shadow-xl border border-blue-100/80 group">
                <img
                  src="/images/hero-composition.png"
                  alt="Amarale Pure Dairy Products - Milk, Paneer, Curd, Ghee, Butter"
                  className="w-full h-auto object-contain rounded-2xl transform group-hover:scale-[1.02] transition-transform duration-500"
                  onError={(e) => { e.target.src = '/images/hero_card_banner.png'; }}
                />
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ─── 2. OUR POPULAR PRODUCTS (Image 5 6-Column Grid) ─── */}
      <section className="py-12 lg:py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Our Popular Products
            </h2>
            <Link
              to="/products"
              className="text-xs sm:text-sm font-bold text-[#0D47A1] hover:text-blue-800 flex items-center gap-1 group transition-colors"
            >
              View All Products <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {products.slice(0, 6).map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-100 p-3 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Product Image Container */}
                <div className="bg-slate-50/70 rounded-xl p-3 flex items-center justify-center h-32 mb-2.5">
                  <img
                    src={product.image_url || product.image || PRODUCT_IMAGES[product.name] || PRODUCT_IMAGES.default}
                    alt={product.name}
                    className="max-h-24 w-auto object-contain drop-shadow-xs"
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                  <div className="hidden items-center justify-center text-4xl">{product.icon || '🥛'}</div>
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-1">{product.name}</h3>
                  <p className="text-[11px] text-slate-400 font-medium">{product.unit || '1 L'}</p>
                  
                  <div className="pt-2 flex items-center justify-between gap-1">
                    <span className="text-sm sm:text-base font-black text-slate-900">
                      ₹{product.price_per_unit || product.price || 52}
                    </span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="px-3 py-1 rounded-full bg-[#0D47A1] hover:bg-blue-800 text-white text-[11px] font-bold flex items-center gap-1 transition-colors active:scale-95 shadow-xs"
                    >
                      <ShoppingCart className="w-3 h-3" /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── 3. CTA BANNER: "A Healthier Tomorrow Starts Today." (Image 5 Exact) ─── */}
      <section className="py-8 lg:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#07244C] via-[#0D47A1] to-[#1565C0] text-white p-6 sm:p-10 shadow-xl">
            
            {/* Background Texture/Circles */}
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-blue-400/10 blur-2xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Left Column: Glass of Milk Image */}
              <div className="hidden sm:flex lg:col-span-2 justify-center lg:justify-start">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/10 backdrop-blur-md p-3 flex items-center justify-center border border-white/20 shadow-md">
                  <span className="text-5xl drop-shadow">🥛</span>
                </div>
              </div>

              {/* Middle Column: Heading, Subtitle & 3 Feature Badges */}
              <div className="lg:col-span-7 space-y-3 text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  A Healthier Tomorrow Starts Today.
                </h2>
                <p className="text-blue-100 text-xs sm:text-sm font-medium leading-relaxed max-w-xl">
                  Subscribe now and give your family the goodness of pure dairy.
                </p>

                {/* 3 Icon Badges */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-100 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                    <Home className="w-3.5 h-3.5 text-blue-300" /> Stronger Families
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-100 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                    <Salad className="w-3.5 h-3.5 text-emerald-300" /> Better Nutrition
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-100 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                    <Smile className="w-3.5 h-3.5 text-amber-300" /> Happier Lives
                  </div>
                </div>
              </div>

              {/* Right Column: CTA Button */}
              <div className="lg:col-span-3 flex justify-center lg:justify-end">
                <Link
                  to="/subscriptions"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-[#0D47A1] hover:bg-blue-50 rounded-full font-black text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all active:scale-95 whitespace-nowrap"
                >
                  Start Your Subscription <ArrowRight className="w-4 h-4 text-[#0D47A1]" />
                </Link>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ─── 4. HOW IT WORKS ─── */}
      <section className="py-12 lg:py-16 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">How It Works</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Simple, reliable doorstep milk delivery every single morning</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { num: 1, label: 'Choose a Plan', desc: 'Select your preferred products, milk types, and daily quantity.' },
              { num: 2, label: 'Set Your Address', desc: 'Tell us your delivery location in Pune and preferred delivery time.' },
              { num: 3, label: 'Enjoy Daily Delivery', desc: 'Get fresh, chilled dairy products placed at your doorstep before 7:00 AM.' },
            ].map((step) => (
              <div key={step.num} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#0D47A1] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                  {step.num}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-base mb-1">{step.label}</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
