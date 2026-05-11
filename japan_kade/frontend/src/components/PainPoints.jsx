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
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white dark:bg-slate-900">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-[#111827] dark:text-white mb-4">
          Running a Spare Parts Business is Hard. <br className="hidden md:block" />
          <span className="text-blue-600">We Make it Easy.</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
          Stop struggling with spreadsheets, WhatsApp messages, and paper diaries. Upgrade to a system built specifically for automotive retailers.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {painPoints.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700"
          >
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-3">
                <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                <p className="text-slate-700 dark:text-slate-300 font-medium">{item.problem}</p>
              </div>
            </div>
            <div className="hidden sm:block w-px bg-slate-200 dark:bg-slate-700"></div>
            <div className="sm:hidden h-px w-full bg-slate-200 dark:bg-slate-700"></div>
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                <p className="text-[#111827] dark:text-white font-semibold">{item.solution}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default PainPoints;
