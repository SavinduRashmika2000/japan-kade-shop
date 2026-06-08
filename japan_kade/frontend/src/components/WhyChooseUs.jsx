import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Clock, PiggyBank, PenTool } from 'lucide-react';
import { BRANDING } from '../config/branding';

const reasons = [
  {
    icon: <UserCheck className="w-8 h-8 text-red-500" />,
    title: 'Genuine OEM Parts',
    desc: 'We stock only authentic, top-grade Japanese spare parts sourced directly from trusted manufacturers.'
  },
  {
    icon: <Clock className="w-8 h-8 text-amber-500" />,
    title: 'Precision Logistics',
    desc: 'Get your parts exactly when you need them. We offer expedited nationwide shipping and pickup.'
  },
  {
    icon: <PiggyBank className="w-8 h-8 text-red-500" />,
    title: 'Unmatched Value',
    desc: 'Direct import models allow us to provide premium parts at highly competitive market rates.'
  },
  {
    icon: <PenTool className="w-8 h-8 text-amber-500" />,
    title: 'Specialist Support',
    desc: 'Our experienced automotive engineers help identify and source the exact parts for your vehicle.'
  }
];

const WhyChooseUs = () => {
  return (
    <section id="why-choose-us" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto rounded-[3rem] my-12 relative overflow-hidden bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800">
      {/* Background neon blobs */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center mb-16 relative z-10">
        <h2 className="text-3xl md:text-5xl font-black text-black dark:text-white mb-6 tracking-tighter uppercase" style={{ color: '#000000' }}>
          Why Choose {BRANDING.name}
        </h2>
        <p className="max-w-2xl mx-auto text-lg leading-relaxed font-bold text-black" style={{ color: '#000000' }}>
          We combine a massive genuine parts inventory with elite automotive knowledge.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 relative z-10">
        {reasons.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1, type: 'spring', bounce: 0.15 }}
            className="text-center flex flex-col items-center p-6 rounded-[2rem] bg-slate-100/90 dark:bg-slate-955/80 border border-slate-200 dark:border-slate-900 hover:border-red-500/30 transition-all duration-300 group cursor-default shadow-sm hover:shadow-md"
          >
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm group-hover:scale-110 flex items-center justify-center mb-6 transition-all duration-300">
              {r.icon}
            </div>
            <h4 className="text-lg font-black text-black mb-3 group-hover:text-red-500 transition-colors" style={{ color: '#000000' }}>{r.title}</h4>
            <p className="text-sm leading-relaxed font-semibold text-black" style={{ color: '#000000' }}>{r.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUs;
