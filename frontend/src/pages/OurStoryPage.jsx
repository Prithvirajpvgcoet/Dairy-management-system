import React, { useState } from 'react';
import { ChevronRight, Award, Heart, Users, ShieldCheck, History } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';

const TABS = [
  { id: 'story', label: 'Our Story', icon: History },
  { id: 'values', label: 'Our Values', icon: Heart },
  { id: 'journey', label: 'Our Journey', icon: Award },
  { id: 'farmers', label: 'Our Farmers', icon: Users },
  { id: 'infrastructure', label: 'Our Infrastructure', icon: ShieldCheck }
];

export default function OurStoryPage() {
  const [activeTab, setActiveTab] = useState('story');

  return (
    <PublicLayout>
      {/* ── Top Hero Banner (Mockup exact) ── */}
      <div className="relative bg-[#0A2540] text-white py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1200&auto=format&fit=crop"
            alt="Pasture Heritage"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Our Story</h1>
            <p className="text-sm sm:text-base text-blue-200 mt-2 max-w-xl">
              A journey of purity, trust and togetherness since 1976.
            </p>
          </div>
          <div className="font-serif italic text-amber-300 text-sm sm:text-base font-semibold">
            Rooted in Values, Growing for Generations ♡
          </div>
        </div>
      </div>

      {/* ── Main Content with Left Sidebar ── */}
      <div className="py-12 sm:py-16 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Sidebar */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-3 border border-slate-200 shadow-xs">
              <div className="space-y-1">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-left ${
                        active
                          ? 'bg-[#0B5ED7] text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                        <span>{tab.label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 ${active ? 'opacity-100' : 'opacity-40'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  From a Small Beginning to Thousands of Happy Homes
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                  What started in 1976 as a small dairy initiative has today grown into a trusted name, bringing pure and fresh dairy products to thousands of families. Our journey has always been driven by a simple belief — healthy families build a healthier tomorrow.
                </p>
              </div>

              {/* Historical Photo Card */}
              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50 relative overflow-hidden">
                <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-200">
                  <img
                    src="https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?w=800&auto=format&fit=crop"
                    alt="Our first dairy unit 1976"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between mt-3 px-1 text-xs text-slate-500 font-semibold">
                  <span>Our first dairy unit • 1976</span>
                  <span className="font-serif italic text-[#0B5ED7]">Same Values, Stronger Tomorrow ♡</span>
                </div>
              </div>

              {/* Stats Row (Mockup exact) */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-center sm:text-left">
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-[#0B5ED7]">1976</p>
                  <p className="text-[11px] text-slate-500 font-bold uppercase mt-0.5">Year of Establishment</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900">100K+</p>
                  <p className="text-[11px] text-slate-500 font-bold uppercase mt-0.5">Happy Customers</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-600">100%</p>
                  <p className="text-[11px] text-slate-500 font-bold uppercase mt-0.5">Commitment to Purity</p>
                </div>
              </div>

              {/* Quote Card (Mockup exact) */}
              <div className="p-5 rounded-2xl bg-[#E8F3FD] border border-blue-200 text-center font-serif italic text-xs sm:text-sm text-[#0A2540] leading-relaxed">
                “Good dairy is not just about nutrition; it's about trust, care and a better tomorrow for every family.”
                <span className="block font-sans not-italic font-bold text-xs text-[#0B5ED7] mt-2">
                  — The Amarale Team
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
