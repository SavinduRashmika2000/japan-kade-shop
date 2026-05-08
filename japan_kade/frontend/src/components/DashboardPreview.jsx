import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, CheckCircle2, Shield, Headphones, Settings, Users, Wrench, Package, UserCircle, Receipt, BarChart2 } from 'lucide-react';

const sidebarItems = ['Dashboard', 'Customers', 'Orders', 'Inventory', 'Staff', 'Billing', 'Reports', 'Settings'];
const sidebarIcons = [BarChart2, Users, Receipt, Package, UserCircle, Receipt, BarChart2, Settings];

const DashboardPreview = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* CTA + Dashboard mock */}
      <div
        className="rounded-3xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)' }}
      >
        {/* Decorative rings */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full border border-white/5 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-64 h-64 rounded-full border border-white/5 translate-y-1/2 pointer-events-none"></div>

        <div className="relative z-10 grid lg:grid-cols-2 gap-12 p-10 md:p-16 items-center">
          {/* Left text */}
          <div>
            <p className="text-blue-400 font-semibold tracking-widest uppercase text-xs mb-4">Smart. Simple. Powerful.</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">
              Take Your Spare Parts Business<br />to the Next Level
            </h2>
            <p className="text-blue-100/70 mb-8 text-sm leading-relaxed max-w-md">
              Join hundreds of businesses using Mind Spare Parts to automate their operations and grow their business.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <button
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all shadow-lg hover:opacity-90"
                style={{ background: '#3B82F6' }}
              >
                Get Started Now <ArrowRight className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white border border-white/20 hover:bg-white/10 transition-all">
                <Play className="w-4 h-4" />
                View Demo
              </button>
            </div>
            {/* Trust badges */}
            <div className="flex flex-wrap gap-5">
              {[
                { icon: <CheckCircle2 className="w-4 h-4 text-green-400" />, label: 'Easy to Use' },
                { icon: <Shield className="w-4 h-4 text-blue-400" />, label: 'Secure & Reliable' },
                { icon: <Headphones className="w-4 h-4 text-purple-400" />, label: '24/7 Support' },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-blue-100/70">
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
                  <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Settings className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white text-xs font-semibold">MIND SPARE PARTS</span>
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
                      <div key={i} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer text-[10px] font-medium transition-colors ${i === 0 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                        <Icon className="w-3 h-3 shrink-0" />
                        {item}
                      </div>
                    );
                  })}
                </div>

                {/* Main content */}
                <div className="flex-1 p-4 bg-[#F9FAFB]">
                  <div className="text-xs font-bold text-slate-700 mb-3">Dashboard</div>
