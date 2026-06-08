import React from 'react';
import { motion } from 'framer-motion';
import { FilePlus, Wrench, IndianRupee } from 'lucide-react';

const steps = [
  {
    icon: <FilePlus className="w-8 h-8 text-red-500" />,
    num: "01",
    title: "Create Job Card",
    description: "Quickly log customer details, vehicle issues, and estimated costs in seconds."
  },
  {
    icon: <Wrench className="w-8 h-8 text-amber-500" />,
    num: "02",
    title: "Assign & Track",
    description: "Assign mechanics to the job. Track the progress and spare parts used in real-time."
  },
  {
    icon: <IndianRupee className="w-8 h-8 text-red-500" />,
    num: "03",
    title: "Invoice & Get Paid",
    description: "Generate professional invoices instantly. Send them via WhatsApp/Email and collect payments."
  }
];

const HowItWorks = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      <div className="text-center mb-20">
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter uppercase">
          How It Works
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
          A seamless workflow designed to keep your garage moving fast.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-12 lg:gap-16 relative">
        {/* Connecting line for desktop */}
        <div className="hidden md:block absolute top-14 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-red-600/10 via-red-600 to-amber-500 via-red-600 to-red-600/10 z-0"></div>

        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.2, type: 'spring', bounce: 0.15 }}
            className="relative z-10 flex flex-col items-center text-center p-8 rounded-[2rem] bg-slate-900/40 border border-slate-800/80 shadow-lg hover:border-slate-700/80 transition-colors group"
          >
            {/* Massive background card number indicator */}
            <div className="absolute right-6 top-4 text-slate-800/25 dark:text-slate-800/20 font-black text-6xl select-none group-hover:scale-110 transition-transform duration-300">
              {step.num}
            </div>

            <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-slate-800 shadow-[0_0_25px_rgba(220,38,38,0.05)] flex items-center justify-center mb-6 relative group-hover:shadow-[0_0_30px_rgba(220,38,38,0.15)] transition-all duration-300">
              {step.icon}
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-red-500 transition-colors">
              {step.title}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
