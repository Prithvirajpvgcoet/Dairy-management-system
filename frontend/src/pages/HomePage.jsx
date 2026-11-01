import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Leaf, Clock, Users, ArrowRight, Plus, 
  Sparkles, Heart, CheckCircle2, ChevronRight 
} from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import api from '../api/client';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [popularProducts, setPopularProducts] = useState([
    { id: 1, name: 'Cow Milk', unit: '1L', price_per_unit: 52, image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop' },
    { id: 2, name: 'Buffalo Milk', unit: '1L', price_per_unit: 60, image_url: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?w=400&auto=format&fit=crop' },
    { id: 3, name: 'Curd', unit: '500 g', price_per_unit: 45, image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&auto=format&fit=crop' },
    { id: 4, name: 'Paneer', unit: '200 g', price_per_unit: 110, image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop' },
    { id: 5, name: 'Ghee', unit: '500 g', price_per_unit: 120, image_url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&auto=format&fit=crop' },
    { id: 6, name: 'Butter', unit: '250 g', price_per_unit: 90, image_url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&auto=format&fit=crop' }
  ]);

  useEffect(() => {
    api.get('/products')
      .then(res => {
        if (res.data && res.data.length > 0) {
          setPopularProducts(res.data.slice(0, 6));
        }
      })
      .catch(() => {});
  }, []);

  const handleQuickAdd = (product) => {
    const savedCart = JSON.parse(localStorage.getItem('amarale_cart') || '{}');
    savedCart[product.id] = (savedCart[product.id] || 0) + 1;
    localStorage.setItem('amarale_cart', JSON.stringify(savedCart));
    toast.success(`Added ${product.name} to cart!`);
  };

  return (
    <PublicLayout>
      {/* ── 1. Hero Section (Mockup exact) ── */}
      <section className="bg-white py-12 lg:py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-5 text-left">
              {/* Eyebrow */}
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                PURE DAIRY • HEALTHY FAMILIES • SINCE 1976
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0A2540] tracking-tight leading-[1.12]">
                Purity, Trust & Taste <br />
                <span className="text-[#0B5ED7]">in Every Drop.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base text-slate-600 max-w-xl leading-relaxed">
                We deliver pure and fresh milk & dairy products directly to your doorstep, every day.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Link
                  to="/subscriptions"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#0B5ED7] hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all"
                >
                  <span>Start Subscription</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm transition-colors"
                >
                  <span>Explore Products</span>
                </Link>
              </div>

              {/* 4 Trust Badges Horizontal Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0B5ED7] flex items-center justify-center shrink-0">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">100% Natural</p>
                    <p className="text-[10px] text-slate-500">No preservatives</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0B5ED7] flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">Trusted by</p>
                    <p className="text-[10px] text-slate-500">Thousands of Families</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0B5ED7] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">Hygienic & Safe</p>
                    <p className="text-[10px] text-slate-500">From farm to home</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0B5ED7] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">On-time Delivery</p>
                    <p className="text-[10px] text-slate-500">Everyday</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Product Composition */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Product Composition Hero */}
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-b from-blue-50/50 to-slate-50 border border-slate-100 p-4 flex items-center justify-center shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&auto=format&fit=crop"
                    alt="Amarale Fresh Dairy Milk Composition"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-2xl flex items-end p-6">
                    <div className="text-white">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#0B5ED7] text-[10px] font-bold uppercase tracking-wider">
                        Pure Farm Milk
                      </span>
                      <h4 className="text-lg font-black mt-1">Untouched Natural Goodness</h4>
                    </div>
                  </div>
                </div>

                {/* Floating Handwritten Script Badge */}
                <div className="absolute -top-3 -right-3 sm:-right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-blue-100 flex items-center gap-2">
                  <span className="font-serif italic font-semibold text-xs sm:text-sm text-[#0B5ED7]">
                    Goodness from Our Farms to your Home ♡
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. Our Popular Products (6 Cards in a row) ── */}
      <section className="py-12 bg-slate-50/70 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Our Popular Products
            </h2>
            <Link
              to="/products"
              className="text-xs font-bold text-[#0B5ED7] hover:underline flex items-center gap-1"
            >
              <span>View All Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="aspect-square rounded-xl bg-slate-50 overflow-hidden mb-3 p-2 flex items-center justify-center">
                    <img
                      src={p.image_url || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop'}
                      alt={p.name}
                      className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{p.unit || '1L'}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-base font-black text-slate-900">
                    ₹{parseFloat(p.price_per_unit).toFixed(0)}
                  </span>
                  <button
                    onClick={() => handleQuickAdd(p)}
                    className="px-3 py-1 rounded-lg bg-[#0B5ED7] hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Healthier Tomorrow Banner (Mockup exact) ── */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#EBF3FC] border border-blue-100 p-8 sm:p-12 overflow-hidden relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column */}
              <div className="lg:col-span-7 space-y-4 text-left">
                <h3 className="text-2xl sm:text-3xl font-black text-[#0A2540] tracking-tight">
                  A Healthier Tomorrow Starts Today.
                </h3>
                <p className="text-sm text-slate-600 max-w-md">
                  Subscribe now and give your family the goodness of pure dairy.
                </p>

                {/* 3 Icons */}
                <div className="flex items-center gap-6 pt-2 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0B5ED7] flex items-center justify-center font-bold text-xs">✓</span>
                    <span>Stronger Families</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0B5ED7] flex items-center justify-center font-bold text-xs">✓</span>
                    <span>Better Nutrition</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0B5ED7] flex items-center justify-center font-bold text-xs">✓</span>
                    <span>Happier Lives</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    to="/subscriptions"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#0B5ED7] hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all"
                  >
                    <span>Start Your Subscription</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Smiling Girl Drinking Milk */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div className="relative w-64 sm:w-72 aspect-square rounded-2xl overflow-hidden shadow-md border-4 border-white bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop"
                    alt="Child Drinking Fresh Healthy Milk"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
