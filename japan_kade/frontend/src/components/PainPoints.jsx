import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, CheckCircle2 } from 'lucide-react';

const painPoints = [
  {
    problem: "Losing track of handwritten bills and stock records.",
    solution: "Digital inventory and billing accessible from any device.",
  },
  {
    problem: "Losing customers because you can't find parts quickly.",
    solution: "Instant stock lookup and fast billing to keep customers happy.",
  },
  {
    problem: "Not knowing which spare parts are running out of stock.",
    solution: "Real-time inventory tracking with low-stock alerts.",
  },
  {
    problem: "Spending hours calculating end-of-day revenue and pending payments.",
    solution: "Instant financial reports and 1-click invoicing.",
  }
];

const PainPoints = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter uppercase">
          Running a Spare Parts Business is Hard.<br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DC2626] to-[#F59E0B]">
            We Make it Easy.
          </span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
          Stop struggling with spreadsheets, WhatsApp messages, and paper diaries. Upgrade to a system built specifically for automotive retailers.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {painPoints.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1, type: 'spring' }}
            className="flex flex-col sm:flex-row gap-6 p-8 rounded-[2rem] bg-slate-900/60 border border-slate-800 hover:border-red-500/20 transition-colors duration-300 shadow-[0_15px_30px_rgba(0,0,0,0.1)] relative overflow-hidden"
          >
            {/* Subtle glow behind card */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex-1 relative z-10">
              <div className="flex items-start gap-3.5 mb-3">
                <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                <p className="text-slate-300 font-medium leading-relaxed">{item.problem}</p>
              </div>
            </div>
            
            <div className="hidden sm:block w-px bg-slate-800"></div>
            <div className="sm:hidden h-px w-full bg-slate-800 my-2"></div>
            
            <div className="flex-1 relative z-10">
              <div className="flex items-start gap-3.5">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-white font-bold leading-relaxed">{item.solution}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default PainPoints;
