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