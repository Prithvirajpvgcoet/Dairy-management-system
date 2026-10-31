import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, CheckCircle2, AlertTriangle, Snowflake, 
  FlaskConical, Sparkles, ChevronRight, Award, Truck 
} from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';

const QUALITY_STAGES = [
  {
    step: '01',
    title: 'Milking & 4°C Chilling',
    subtitle: 'Within 60 Minutes of Milking',
    desc: 'Milk is collected in sanitary stainless-steel tanks and cooled immediately to 4°C to halt bacterial growth and preserve natural enzymes.',
    icon: Snowflake
  },
  {
    step: '02',
    title: '24-Point Lab Screening',
    subtitle: 'Daily Batch Testing',
    desc: 'Every incoming batch undergoes digital testing for fat, SNF, and chemical adulterants including urea, starch, detergent, and synthetic oils.',
    icon: FlaskConical
  },
  {
    step: '03',
    title: 'HTST Pasteurization',
    subtitle: 'Gentle Pure Processing',
    desc: 'Heated to exactly 72°C for 15 seconds and rapidly cooled, destroying pathogenic bacteria while keeping taste, calcium, and vitamins intact.',
    icon: Award
  },
  {
    step: '04',
    title: 'Sunrise Insulated Delivery',
    subtitle: 'Doorstep by 7:00 AM',
    desc: 'Packaged in BPA-free food grade pouches and transported in refrigerated crates directly to your doorstep in Pune.',
    icon: Truck
  }
];

const LAB_PARAMETERS = [
  { parameter: 'Adulterants (Urea, Detergent, Starch, Neutralizers)', standard: 'Zero / Negative', amarale: '100% Zero / Verified Negative' },
  { parameter: 'Cow Milk Fat Content', standard: 'Min 3.5%', amarale: '3.8% - 4.2% Natural Fat' },
  { parameter: 'Cow Milk Solid Not Fat (SNF)', standard: 'Min 8.5%', amarale: '8.8% - 9.1% Natural SNF' },
  { parameter: 'Buffalo Milk Fat Content', standard: 'Min 6.0%', amarale: '6.5% - 7.2% Creamy Fat' },
  { parameter: 'Antibiotic Residue & Synthetic Hormones', standard: 'Not Detected', amarale: 'Certified Free / Absent' },
  { parameter: 'Microbial Colony Count (SPC)', standard: '< 30,000 CFU/ml', amarale: '< 5,000 CFU/ml (Ultra-Clean)' },
  { parameter: 'Cold-Chain Delivery Temperature', standard: '< 8°C', amarale: 'Maintained at 4°C - 5°C' }
];

export default function QualityPage() {
  return (
    <PublicLayout>
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200 py-12 sm:py-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-3">
            <ShieldCheck className="w-4 h-4" /> 24-Point Daily Laboratory Testing
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Quality & Infrastructure
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mt-3 leading-relaxed">
            We don't take purity for granted. See how every liter of Amarale milk is tracked, tested, chilled, and delivered with surgical hygiene.
          </p>
        </div>
      </div>

      {/* ── 4-Stage Protocol ── */}
      <div className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-[#0D47A1] uppercase tracking-wider">End-to-End Cold Chain</span>
            <h2 className="text-3xl font-black text-slate-900 mt-1">
              From Grass to Glass: The 4 Stages
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {QUALITY_STAGES.map((stg) => {
              const Icon = stg.icon;
              return (
                <div
                  key={stg.step}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-3xl font-black text-blue-100">{stg.step}</span>
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0D47A1] flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">{stg.title}</h3>
                    <p className="text-xs font-semibold text-[#0D47A1] mt-0.5">{stg.subtitle}</p>
                    <p className="text-xs text-slate-500 mt-3 leading-relaxed">{stg.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Lab Checkpoints Table ── */}
      <div className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Laboratory Purity Benchmarks
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Every morning batch is tested before packaging in our on-site Kothrud quality lab.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-4 px-6">Check Parameter</th>
                    <th className="py-4 px-6">Regulatory Standard</th>
                    <th className="py-4 px-6 text-[#0D47A1]">Amarale Purity Standard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {LAB_PARAMETERS.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-900">{row.parameter}</td>
                      <td className="py-3.5 px-6 text-slate-500">{row.standard}</td>
                      <td className="py-3.5 px-6 font-bold text-emerald-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{row.amarale}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div className="bg-[#0A2540] text-white py-16 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h3 className="text-2xl sm:text-3xl font-black">Experience The Purity Difference</h3>
          <p className="text-slate-300 text-sm mt-2 mb-6">
            Switch to genuine unadulterated milk for your family tomorrow morning.
          </p>
          <Link
            to="/subscriptions"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-[#0A2540] font-black text-sm hover:bg-blue-50 transition-colors shadow-lg"
          >
            <span>Start Fresh Subscription</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
