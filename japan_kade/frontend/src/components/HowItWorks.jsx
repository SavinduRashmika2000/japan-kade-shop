import React from 'react';
import { motion } from 'framer-motion';
import { FilePlus, Wrench, IndianRupee } from 'lucide-react';

const steps = [
  {
    icon: <FilePlus className="w-8 h-8 text-blue-600" />,
    title: "1. Create Job Card",
    description: "Quickly log customer details, vehicle issues, and estimated costs in seconds."
  },
  {
    icon: <Wrench className="w-8 h-8 text-blue-600" />,
    title: "2. Assign & Track",
    description: "Assign mechanics to the job. Track the progress and spare parts used in real-time."
  },
  {
    icon: <IndianRupee className="w-8 h-8 text-blue-600" />,
    title: "3. Invoice & Get Paid",
    description: "Generate professional invoices instantly. Send them via WhatsApp/Email and collect payments."
  }
];

const HowItWorks = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-[#111827] dark:text-white mb-4">
          How It Works
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
          A seamless workflow designed to keep your garage moving fast.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-10 relative">
        {/* Connecting line for desktop */}
        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-100 via-blue-500 to-blue-100 dark:from-blue-900 dark:via-blue-500 dark:to-blue-900 z-0"></div>

        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.2 }}
            className="relative z-10 flex flex-col items-center text-center"
          >
            <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-800 shadow-xl border-4 border-blue-50 dark:border-slate-700 flex items-center justify-center mb-6">
              {step.icon}
            </div>
            <h3 className="text-xl font-bold text-[#111827] dark:text-white mb-3">{step.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
