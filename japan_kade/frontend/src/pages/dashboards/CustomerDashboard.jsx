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
              <config.icon className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-4">
                <h3 className={`text-2xl md:text-3xl font-black tracking-tighter uppercase ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>{job.vehicleNumber || `Bill #${job.id}`}</h3>
                <span className="px-2 py-0.5 rounded-lg bg-slate-900/5 text-[9px] font-black text-slate-400 border border-slate-200">REF: #{job.id}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>{new Date(job.startTime || job.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-200" />
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-${config.color}-600`}>{job.status}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-10 w-full lg:w-auto justify-end">
             <div className="text-right">
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Total Balance</p>
               <p className={`text-3xl md:text-4xl font-black tracking-tighter leading-none ${isActive ? 'text-blue-600' : 'text-slate-900'}`}>Rs. {job.totalAmount?.toLocaleString()}</p>
             </div>
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isExpanded ? 'bg-slate-900 text-white rotate-180' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50'}`}>
               <ChevronDown className="w-6 h-6" />
             </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-50/50 border-t border-slate-100 rounded-b-[2rem]"
          >
            <div className="p-8 md:p-12">
              <div className="bg-white p-8 rounded-[1.5rem] border border-slate-100 shadow-sm relative overflow-hidden group w-full">
                 <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                 <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                   <Package className="w-5 h-5" /> Purchased Parts
                 </h4>
                 {job.items?.length > 0 ? (
                   <div className="space-y-6">
                     {job.items.map((item, i) => (
                       <div key={i} className="flex justify-between items-center">
                         <div className="flex items-center gap-6">
                           <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-sm border border-slate-100">{item.quantity}</div>
                           <span className="text-lg font-black text-slate-800 tracking-tight">{item.itemName}</span>
                         </div>
                         <p className="text-xl font-black text-slate-900 tabular-nums">Rs. {(item.quantity * item.priceAtTime).toLocaleString()}</p>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="py-10 text-center opacity-30">
                     <p className="text-xs font-black uppercase tracking-[0.2em]">No hardware records</p>
                   </div>
                 )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );