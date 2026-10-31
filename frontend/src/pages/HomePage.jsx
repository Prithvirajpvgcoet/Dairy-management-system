import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Leaf, Clock, Truck, ChevronRight, CheckCircle2, 
  Sparkles, Star, Award, ArrowRight, HeartPulse, RefreshCw
} from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import api from '../api/client';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [popularProducts, setPopularProducts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/products?popular=true').catch(() => ({ data: [] })),
      api.get('/plans').catch(() => ({ data: [] }))
    ]).then(([prodRes, planRes]) => {
      setPopularProducts(prodRes.data || []);
      setPlans(planRes.data || []);
      setLoading(false);
    });
  }, []);

  return (
    <PublicLayout>
      {/* ── 1. Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-slate-50 pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading and CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-[#0D47A1] text-xs sm:text-sm font-semibold tracking-wide">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Pune’s Most Trusted Family Dairy Since 1976</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                100% Pure Farm Milk, <br className="hidden sm:inline" />
                <span className="text-[#0D47A1] bg-gradient-to-r from-[#0D47A1] to-blue-600 bg-clip-text text-transparent">
                  Delivered by 7:00 AM
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Enjoy unadulterated Cow & Buffalo milk straight from grass-fed cows in Mulshi and Purandar. Chilled to 4°C within 60 minutes, tested across 24 quality checkpoints, and placed on your doorstep every sunrise.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/subscriptions"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#0D47A1] hover:bg-blue-800 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  <span>Choose Your Daily Plan</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/products"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-300 shadow-sm transition-all"
                >
                  <span>Browse All Products</span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </Link>
              </div>

              {/* Quick Trust Highlights */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200/80 max-w-lg mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-black text-slate-900">10,000+</p>
                  <p className="text-xs text-slate-500 font-medium">Pune Households</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-black text-slate-900">50 Years</p>
                  <p className="text-xs text-slate-500 font-medium">Legacy of Trust</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-black text-emerald-600">0%</p>
                  <p className="text-xs text-slate-500 font-medium">Adulteration / Preservatives</p>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] sm:aspect-[4/3.5] bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&auto=format&fit=crop"
                    alt="Fresh Pure Cow Milk"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                    <span className="px-2.5 py-1 bg-amber-400 text-slate-900 text-xs font-black uppercase rounded-md tracking-wider w-fit mb-2">
                      Sunrise Delivery
                    </span>
                    <h3 className="text-xl font-bold">Unprocessed Natural Freshness</h3>
                    <p className="text-xs text-slate-200 mt-1">Delivered cold at 4°C directly from farm to table.</p>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -bottom-6 -left-4 sm:-left-6 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quality Verified</p>
                    <p className="text-sm font-bold text-slate-900">24-Point Lab Tested</p>
                    <p className="text-[11px] text-slate-500">Every morning batch tested</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. Trust Badges Band ── */}
      <section className="bg-white py-12 border-y border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0D47A1] flex items-center justify-center shrink-0">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">100% Farm Pure</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Single-origin milk with no chemical powders, preservatives, or artificial thickeners.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0D47A1] flex items-center justify-center shrink-0">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Chilled to 4°C in 60m</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Rapid cold-chain locking natural vitamins, probiotics, and authentic country taste.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0D47A1] flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Delivered by 7:00 AM</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Rain or shine, your dedicated local route partner delivers before your tea boils.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0D47A1] flex items-center justify-center shrink-0">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Pause & Skip Anytime</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Traveling? Pause delivery up to 10 PM. You are billed strictly for delivered milk.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Popular Products Grid ── */}
      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold text-[#0D47A1] uppercase tracking-wider">Fresh From The Farm</span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
                Our Most Popular Products
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Wholesome dairy crafted with uncompromising hygiene and authentic taste.
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0D47A1] hover:text-blue-800 transition-colors"
            >
              <span>View All Dairy Products</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={product.image_url || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-lg text-xs font-bold text-slate-800 shadow-sm">
                    {product.category || 'Dairy'}
                  </div>
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-base shadow-sm">
                    {product.icon || '🥛'}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-[#0D47A1] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {product.description || 'Pure and natural dairy directly from vetted farms.'}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-medium">Per {product.unit}</span>
                      <p className="text-xl font-black text-slate-900">₹{parseFloat(product.price_per_unit).toFixed(0)}</p>
                    </div>
                    <Link
                      to="/subscriptions"
                      className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-[#0D47A1] text-[#0D47A1] hover:text-white font-bold text-xs transition-colors"
                    >
                      Subscribe
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Subscription Plans Preview ── */}
      <section className="py-16 sm:py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-[#0D47A1] uppercase tracking-wider">Hassle-Free Mornings</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
              Popular Daily Subscriptions
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Bills calculate automatically from actual deliveries. Skip dates anytime with 1 tap.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.filter(p => !p.is_custom).slice(0, 3).map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all ${
                  plan.is_popular
                    ? 'border-2 border-[#0D47A1] bg-blue-50/30 shadow-xl scale-[1.02]'
                    : 'border border-slate-200 bg-white shadow-sm hover:shadow-md'
                }`}
              >
                {plan.is_popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#0D47A1] text-white text-xs font-bold uppercase tracking-wider shadow">
                    Most Loved in Pune
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-2 min-h-[36px]">{plan.tagline}</p>

                  <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-500 font-medium">Estimated 30-Day Cost</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-black text-slate-900">₹{plan.monthly_price}</span>
                      <span className="text-xs text-slate-500">/ month</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      (Billed strictly as delivered at ₹{(plan.daily_price || plan.monthly_price/30).toFixed(0)}/day)
                    </p>
                  </div>

                  <div className="space-y-2.5 mb-8">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">What’s Included:</p>
                    {plan.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{parseFloat(item.quantity_per_day)} x {item.product_name} ({item.unit})</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Free morning delivery before 7:00 AM</span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/subscriptions?select=${plan.id}`}
                  className={`w-full py-3.5 rounded-xl text-center font-bold text-sm transition-all shadow-sm ${
                    plan.is_popular
                      ? 'bg-[#0D47A1] hover:bg-blue-800 text-white shadow-md'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  Choose {plan.name}
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/subscriptions"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 font-bold text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span>Want a custom product mix? Explore Custom Subscription</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. How It Works (3 Steps) ── */}
      <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-[#0D47A1] uppercase tracking-wider">Simple 3-Step Process</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
              How Amarale Dairy Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#0D47A1] font-black text-xl flex items-center justify-center mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Pick Your Daily Milk</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Choose Cow Milk, Buffalo Milk, Curd, or Paneer. Set your recurring daily quantity in under 2 minutes.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#0D47A1] font-black text-xl flex items-center justify-center mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Sunrise Doorstep Delivery</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Your dedicated delivery partner arrives silently between 5:30 AM and 7:00 AM every morning with cold-packed milk.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#0D47A1] font-black text-xl flex items-center justify-center mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Paisa-Accurate Month-End Bill</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                No fixed locks. Pay only for what was actually delivered. Download full PDF invoice and pay via UPI or Card.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Purity & Lab Guarantee Banner ── */}
      <section className="bg-[#0A2540] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                Uncompromising Quality
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                Why 10,000+ Pune Families Trust Amarale Milk
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                We believe true nourishment comes with zero shortcuts. Our milk is tested every single morning before packaging for density, SNF, fat, adulterants (urea, starch, detergents), and antibiotics. If a batch fails even one test, it never leaves the facility.
              </p>
            </div>
            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <Link
                to="/quality"
                className="px-6 py-3.5 rounded-xl bg-white text-[#0A2540] font-black text-sm hover:bg-blue-50 transition-colors shadow-lg"
              >
                Inspect Quality Standards
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Final Call to Action ── */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-[#0D47A1] text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Start Your Morning With Fresh Milk Tomorrow
          </h2>
          <p className="text-base sm:text-lg text-blue-100 mb-8 max-w-xl mx-auto">
            Order before 10:00 PM tonight and receive fresh, unadulterated dairy right at your doorstep tomorrow morning by 7:00 AM.
          </p>
          <Link
            to="/subscriptions"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-[#0D47A1] font-black text-base shadow-xl hover:bg-blue-50 transition-all hover:scale-105"
          >
            <span>Subscribe Today</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
