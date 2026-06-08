import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, CheckCircle2, Shield, Headphones, Settings, Users, Wrench, Package, UserCircle, Receipt, BarChart2 } from 'lucide-react';
import { BRANDING } from '../config/branding';

const sidebarItems = ['Dashboard', 'Customers', 'Orders', 'Inventory', 'Staff', 'Billing', 'Reports', 'Settings'];
const sidebarIcons = [BarChart2, Users, Receipt, Package, UserCircle, Receipt, BarChart2, Settings];

const DashboardPreview = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* CTA + Dashboard mock */}
      <div
        className="rounded-3xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)' }}
      >
        {/* Decorative rings */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full border border-white/5 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-64 h-64 rounded-full border border-white/5 translate-y-1/2 pointer-events-none"></div>

        <div className="relative z-10 grid lg:grid-cols-2 gap-12 p-10 md:p-16 items-center">
          {/* Left text */}
          <div>
            <p className="text-[#F59E0B] font-semibold tracking-widest uppercase text-xs mb-4">Precision. Quality. Engineering.</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 leading-tight font-heading">
              Manage Your Spare Parts &<br />Imports Portfolio Effortlessly
            </h2>
            <p className="text-slate-300 mb-8 text-sm leading-relaxed max-w-md">
              Join hundreds of auto-dealers and service centers using {BRANDING.name} to track invoices, manage stock, and optimize operations.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <button
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all shadow-lg hover:opacity-90 cursor-pointer"
                style={{ background: '#DC2626' }}
              >
                Inquire Now <ArrowRight className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white border border-white/20 hover:bg-white/10 transition-all cursor-pointer">
                <Play className="w-4 h-4" />
                View Demo
              </button>
            </div>
            {/* Trust badges */}
            <div className="flex flex-wrap gap-5">
              {[
                { icon: <CheckCircle2 className="w-4 h-4 text-green-400" />, label: 'Easy Audits' },
                { icon: <Shield className="w-4 h-4 text-[#F59E0B]" />, label: 'Genuine Stock tracking' },
                { icon: <Headphones className="w-4 h-4 text-slate-300" />, label: 'Direct Support' },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-slate-300">
                  {b.icon} {b.label}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-2xl transform -rotate-1 hover:rotate-0 transition-transform duration-500">
              {/* Dashboard chrome header */}
              <div className="bg-slate-800 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#DC2626] flex items-center justify-center">
                    <Settings className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white text-xs font-semibold tracking-wide font-heading">{BRANDING.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-600"></div>
                </div>
              </div>

              <div className="flex" style={{ minHeight: '260px' }}>
                {/* Sidebar */}
                <div className="bg-slate-900 w-28 shrink-0 p-3 space-y-1">
                  {sidebarItems.map((item, i) => {
                    const Icon = sidebarIcons[i];
                    return (
                      <div key={i} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer text-[10px] font-medium transition-colors ${i === 0 ? 'bg-[#DC2626] text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                        <Icon className="w-3 h-3 shrink-0" />
                        {item}
                      </div>
                    );
                  })}
                </div>

                {/* Main content */}
                <div className="flex-1 p-4 bg-[#F9FAFB]">
                  <div className="text-xs font-bold text-slate-700 mb-3">Inventory Command</div>

                  {/* Mini stat cards */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: 'Registered Clients', value: '320', up: '+12.5%' },
                      { label: 'Parts Sold', value: '1,180', up: '+10.3%' },
                      { label: 'Net Operations', value: 'LKR 1.2M', up: '+8.5%' },
                    ].map((s, i) => (
                      <div key={i} className="bg-white rounded-xl p-2 shadow-sm border border-slate-100">
                        <div className="text-[9px] text-slate-400 mb-0.5">{s.label}</div>
                        <div className="text-xs font-bold text-slate-800">{s.value}</div>
                        <div className="text-[9px] text-green-500 font-medium">{s.up}</div>
                      </div>
                    ))}
                  </div>

                  {/* Charts row */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Revenue chart */}
                    <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                      <div className="text-[9px] font-semibold text-slate-600 mb-2">Import Intake Vol</div>
                      <svg viewBox="0 0 100 40" className="w-full" style={{ height: '40px' }}>
                        <polyline points="0,35 15,25 30,30 45,15 60,20 75,10 100,18"
                          fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
                        <polygon points="0,35 15,25 30,30 45,15 60,20 75,10 100,18 100,40 0,40"
                          fill="rgba(220,38,38,0.1)" />
                      </svg>
                    </div>

                    {/* Donut chart */}
                    <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                      <div className="text-[9px] font-semibold text-slate-600 mb-2">Availability</div>
                      <div className="flex items-center gap-2">
                        <svg viewBox="0 0 36 36" className="w-10 h-10 shrink-0">
                          <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="5" />
                          <circle cx="18" cy="18" r="15" fill="none" stroke="#DC2626" strokeWidth="5"
                            strokeDasharray="60 40" strokeDashoffset="25" />
                          <circle cx="18" cy="18" r="15" fill="none" stroke="#10b981" strokeWidth="5"
                            strokeDasharray="25 75" strokeDashoffset="-35" />
                        </svg>
                        <div className="space-y-1">
                          {[['Engine Parts', 'bg-[#DC2626]', '65%'], ['Tools', 'bg-green-500', '25%'], ['Accessories', 'bg-slate-200', '10%']].map(([l, c, v]) => (
                            <div key={l} className="flex items-center gap-1">
                              <div className={`w-1.5 h-1.5 rounded-full ${c}`}></div>
                              <span className="text-[8px] text-slate-500">{l}</span>
                              <span className="text-[8px] font-bold text-slate-700">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
