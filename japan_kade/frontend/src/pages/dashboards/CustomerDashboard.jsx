import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, Clock, Calendar, LogOut, Search,
  History, Activity, Wrench, Package, CheckCircle2, ChevronDown, ChevronRight, Zap, Sparkles, Layers
} from 'lucide-react';
import jobCardService from '../../services/jobCardService';

// --- Enhanced Stat Capsules ---

const StatCapsule = ({ label, value, icon: Icon, color }) => (
  <motion.div 
    whileHover={{ scale: 1.02, y: -2 }}
    className="relative flex-1 min-w-[200px] h-20 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center px-6 overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-${color}-500/5 to-transparent`} />
    <div className={`absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full bg-${color}-500 transition-all duration-700`} />
    <div className="relative z-10 flex items-center gap-4 w-full">
      <div className={`w-10 h-10 rounded-xl bg-${color}-50 flex items-center justify-center text-${color}-600 group-hover:rotate-12 transition-transform duration-500`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
        <h3 className="text-2xl font-black text-slate-900 leading-none">{value}</h3>
      </div>
      <div className={`w-6 h-6 rounded-full bg-${color}-500/10 flex items-center justify-center`}>
        <div className={`w-1.5 h-1.5 rounded-full bg-${color}-500 animate-pulse`} />
      </div>
    </div>
  </motion.div>
);

// --- High-Visibility Bill Card ---

const BillCard = ({ job, isExpanded, onClick }) => {
  const configs = {
    WAITING: { color: 'amber', icon: Clock, bg: 'bg-amber-50/30', border: 'border-amber-100' },
    PAID: { color: 'emerald', icon: CheckCircle2, bg: 'bg-white', border: 'border-slate-100' },
    CANCELLED: { color: 'red', icon: Zap, bg: 'bg-red-50/10', border: 'border-red-50' }
  };
  const config = configs[job.status] || configs.WAITING;
  const isActive = job.status === 'WAITING';

  return (
    <motion.div 
      layout
      className={`relative mb-4 rounded-[2rem] transition-all duration-500 ${
        isExpanded 
          ? 'shadow-xl ring-2 ring-blue-500/10 bg-white border-blue-100' 
          : `${config.bg} border ${config.border} shadow-sm hover:shadow-md hover:border-blue-300`
      }`}
    >
      {/* Active Indicator Pulse */}
      {isActive && (
        <div className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-${config.color}-400 opacity-75`}></span>
          <span className={`relative inline-flex rounded-full h-4 w-4 bg-${config.color}-500`}></span>
        </div>
      )}

      <div 
        onClick={onClick}
        className="p-6 md:p-8 cursor-pointer"
      >
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6 w-full lg:w-auto">
            <div className={`w-16 h-16 rounded-2xl bg-${config.color}-500 flex items-center justify-center text-white shadow-lg shadow-${config.color}-500/20`}>