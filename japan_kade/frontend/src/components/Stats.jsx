import React from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle2, Package, IndianRupee } from 'lucide-react';

const stats = [
  { value: '1,250+', label: 'Happy Customers', icon: <Users className="w-6 h-6 text-red-500" />, iconBg: 'bg-red-500/10 border border-red-500/20' },
  { value: '3,450+', label: 'Orders Fulfilled', icon: <CheckCircle2 className="w-6 h-6 text-amber-500" />, iconBg: 'bg-amber-500/10 border border-amber-500/20' },
  { value: '2,800+', label: 'Parts Managed', icon: <Package className="w-6 h-6 text-red-500" />, iconBg: 'bg-red-500/10 border border-red-500/20' },
  { value: '₹12.5L+', label: 'Revenue Generated', icon: <IndianRupee className="w-6 h-6 text-amber-500" />, iconBg: 'bg-amber-500/10 border border-amber-500/20' },
];

const Stats = () => {
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, type: 'spring', bounce: 0.2 }}
        className="rounded-3xl overflow-hidden bg-slate-900/90 border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative"
      >
        {/* Subtle radial background glow */}
        <div className="absolute -left-10 top-0 w-72 h-72 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-10 bottom-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-800/80 relative z-10">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1, type: 'spring' }}
              className="flex items-center gap-4 px-6 py-8 md:px-8"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${stat.iconBg}`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">{stat.value}</div>
                <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Stats;
