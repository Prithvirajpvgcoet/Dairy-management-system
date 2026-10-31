import React, { useState } from 'react';
import { 
  History, Heart, Award, Users, ShieldCheck, 
  ChevronRight, Sparkles, MapPin, CheckCircle2 
} from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';

const TABS = [
  { id: 'story', label: 'Our Heritage (Since 1976)', icon: History },
  { id: 'values', label: 'Core Values & Philosophy', icon: Heart },
  { id: 'journey', label: 'Milestones & Timeline', icon: Award },
  { id: 'farmers', label: 'Ethical Farmer Network', icon: Users },
  { id: 'infrastructure', label: 'Cold-Chain Infrastructure', icon: ShieldCheck }
];

export default function OurStoryPage() {
  const [activeTab, setActiveTab] = useState('story');

  return (
    <PublicLayout>
      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold text-[#0D47A1] uppercase tracking-wider">Five Decades of Trust</span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-1">
            The Story of Amarale Dairy
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-3 max-w-3xl leading-relaxed">
            From a humble single-shed dairy in Kothrud in 1976 to Pune's benchmark for unadulterated morning farm milk. 
            Discover how fifty years of passion continues to nourish generations.
          </p>

          {/* Stats Band */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-8 border-t border-slate-100">
            <div>
              <p className="text-3xl sm:text-4xl font-black text-[#0D47A1]">1976</p>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Founded in Pune</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-slate-900">10,000+</p>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Daily Happy Families</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-slate-900">250+</p>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Partnered Family Farms</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-emerald-600">4°C</p>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Immediate Rapid Chilling</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content with Left Sidebar ── */}
      <div className="py-12 sm:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Sidebar Navigation */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-4 border border-slate-200 shadow-sm sticky top-24">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-4 py-2">
                Table of Contents
              </h3>
              <div className="space-y-1">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all text-left ${
                        active
                          ? 'bg-[#0D47A1] text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                        <span>{tab.label}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${active ? 'opacity-100' : 'opacity-30'}`} />
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
                <p className="text-xs font-bold text-[#0D47A1]">Visit Our Pune Facility</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  We welcome families for weekend dairy tours at our Kothrud processing center.
                </p>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm min-h-[500px]">
              {/* TAB 1: STORY */}
              {activeTab === 'story' && (
                <div className="space-y-6 animate-in fade-in-50">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0D47A1] text-xs font-bold">
                    <History className="w-3.5 h-3.5" /> Established 1976
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    A Journey Rooted in Pure Pune Traditions
                  </h2>
                  <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 shadow-sm">
                    <img
                      src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1000&auto=format&fit=crop"
                      alt="Dairy Heritage Cattle"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    In 1976, late Shri Ramchandra Amarale started with just three indigenous cows in rural Kothrud, delivering fresh milk on a bicycle to neighboring homes. At a time when industrial milk processing introduced synthetic additives, Amarale stood firm on one unbending principle: <b>milk should never be altered from what the cow provides.</b>
                  </p>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    Over the decades, as Pune grew from a quiet educational town into a bustling IT metropolis, the Amarale family preserved traditional Vedic chilling practices while adopting modern stainless-steel pasteurization and cold-chain fleets. Today, the third generation of the Amarale family continues this legacy with the same warmth and dedication.
                  </p>
                </div>
              )}

              {/* TAB 2: VALUES */}
              {activeTab === 'values' && (
                <div className="space-y-6 animate-in fade-in-50">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    Our 4 Non-Negotiable Pillars
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0D47A1] flex items-center justify-center font-bold mb-3">
                        1
                      </div>
                      <h4 className="font-bold text-slate-900 text-base">Zero Adulteration Guarantee</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        No skimmed milk powder, no synthetic thickeners, and no chemical preservatives. Pure liquid nutrition as nature intended.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0D47A1] flex items-center justify-center font-bold mb-3">
                        2
                      </div>
                      <h4 className="font-bold text-slate-900 text-base">Ethical Bovine Care</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Cattle roam freely on open green pastures in Mulshi. No oxytocin or synthetic growth hormone injections ever.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0D47A1] flex items-center justify-center font-bold mb-3">
                        3
                      </div>
                      <h4 className="font-bold text-slate-900 text-base">Fair Farmer Prosperity</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        We pay 15% above standard APMC market procurement rates to our 250+ partnered family farms, ensuring honest sustainable livelihoods.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0D47A1] flex items-center justify-center font-bold mb-3">
                        4
                      </div>
                      <h4 className="font-bold text-slate-900 text-base">Transparent Exact Billing</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Every single delivery tick is logged transparently. You never pay for milk that was skipped, paused, or undelivered.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TIMELINE */}
              {activeTab === 'journey' && (
                <div className="space-y-6 animate-in fade-in-50">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    Five Decades of Milestones
                  </h2>
                  <div className="relative border-l-2 border-blue-200 ml-4 space-y-8 pl-6 my-6">
                    <div className="relative">
                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#0D47A1] border-4 border-white"></div>
                      <span className="text-xs font-bold text-[#0D47A1]">1976</span>
                      <h4 className="text-lg font-bold text-slate-900 mt-0.5">Founding Day in Kothrud</h4>
                      <p className="text-xs text-slate-600 mt-1">Bicycle delivery of 40 liters of morning milk to 25 households.</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#0D47A1] border-4 border-white"></div>
                      <span className="text-xs font-bold text-[#0D47A1]">1994</span>
                      <h4 className="text-lg font-bold text-slate-900 mt-0.5">First Automated Bulk Chilling Center</h4>
                      <p className="text-xs text-slate-600 mt-1">Installed European refrigeration holding 5,000 liters daily at 4°C.</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#0D47A1] border-4 border-white"></div>
                      <span className="text-xs font-bold text-[#0D47A1]">2010</span>
                      <h4 className="text-lg font-bold text-slate-900 mt-0.5">Expansion across Western Pune</h4>
                      <p className="text-xs text-slate-600 mt-1">Expanded routes into Paud Road, Aundh, Baner, and Deccan Gymkhana.</p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#0D47A1] border-4 border-white"></div>
                      <span className="text-xs font-bold text-[#0D47A1]">2026</span>
                      <h4 className="text-lg font-bold text-slate-900 mt-0.5">Digital ERP & Smart Logistics</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Launched real-time GPS delivery tracking, automated 1-tap customer skips, and paisa-accurate billing.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: FARMERS */}
              {activeTab === 'farmers' && (
                <div className="space-y-6 animate-in fade-in-50">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    Our 250+ Partnered Grass-Fed Dairy Farms
                  </h2>
                  <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 shadow-sm">
                    <img
                      src="https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?w=1000&auto=format&fit=crop"
                      alt="Dairy Cows Pasture"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    We partner directly with smallholder dairy farming families across Mulshi, Purandar, and Bhor valleys. Rather than factory confinement, our cows feed on organic green fodder, maize stalks, and freshwater from Sahyadri reservoirs.
                  </p>
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                    <p className="text-xs sm:text-sm text-emerald-900 font-medium">
                      Every partner farmer receives free veterinary checkups, subsidized mineral feed, and direct weekly bank payouts with zero middlemen.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 5: INFRASTRUCTURE */}
              {activeTab === 'infrastructure' && (
                <div className="space-y-6 animate-in fade-in-50">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    State-of-the-Art Cold Chain & Hygiene
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    The secret to farm-fresh taste is speed and temperature control. Milk spoils when exposed to tropical heat. That is why our cold chain is sealed:
                  </p>
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl border border-slate-200 flex items-start gap-3">
                      <span className="font-bold text-[#0D47A1] text-base">01.</span>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">4°C Chilling within 60 Minutes</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Raw milk is immediately chilled in insulated bulk milk tanks.</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-200 flex items-start gap-3">
                      <span className="font-bold text-[#0D47A1] text-base">02.</span>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Automated Sterile Pouching</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Untouched by human hands from pasteurizer to food-grade pouch.</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-200 flex items-start gap-3">
                      <span className="font-bold text-[#0D47A1] text-base">03.</span>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Insulated Sunrise Crates</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Delivered in temperature-controlled insulated route crates by 7 AM.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
