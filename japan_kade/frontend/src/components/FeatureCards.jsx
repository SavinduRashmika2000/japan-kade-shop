import React from 'react';
import { motion } from 'framer-motion';
import { Users, Wrench, Package, UserCircle, Receipt, BarChart2 } from 'lucide-react';

const features = [
  {
    icon: <Users className="w-6 h-6 text-red-500" />,
    iconBg: 'bg-red-500/10 border border-red-500/20',
    title: 'Customer Management',
    desc: 'Manage customer profiles, vehicles, service history and communication in one place.',
  },
  {
    icon: <Wrench className="w-6 h-6 text-amber-500" />,
    iconBg: 'bg-amber-500/10 border border-amber-500/20',
    title: 'Service & Job Cards',
    desc: 'Log customer issues, assign mechanics, track service durations, and manage spare parts usage dynamically.',
  },
  {
    icon: <Package className="w-6 h-6 text-red-500" />,
    iconBg: 'bg-red-500/10 border border-red-500/20',
    title: 'Inventory Management',
    desc: 'Track spare parts, manage stock levels, get low stock alerts and never run out of essentials.',
  },
  {
    icon: <UserCircle className="w-6 h-6 text-amber-500" />,
    iconBg: 'bg-amber-500/10 border border-amber-500/20',
    title: 'Staff Management',
    desc: 'Manage staff roles, schedules, performance and payroll efficiently.',
  },
  {
    icon: <Receipt className="w-6 h-6 text-red-500" />,
    iconBg: 'bg-red-500/10 border border-red-500/20',
    title: 'Billing & Invoicing',
    desc: 'Generate invoices, track payments, manage discounts and get paid faster.',
  },
  {
    icon: <BarChart2 className="w-6 h-6 text-amber-500" />,
    iconBg: 'bg-amber-500/10 border border-amber-500/20',
    title: 'Reports & Analytics',
    desc: 'Get insights into your business with detailed reports and beautiful analytics.',
  },
];

const FeatureCards = () => {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <p className="text-red-500 font-bold tracking-widest uppercase text-[10px] mb-3">Powerful Features</p>
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter uppercase">
          Everything You Need to Manage<br className="hidden md:block" /> Your Spare Parts Business
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
          Powerful tools to streamline operations and deliver quality parts faster.
        </p>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.08, type: 'spring', bounce: 0.1 }}
            className="group bg-slate-900/50 hover:bg-slate-900/80 rounded-[2rem] p-8 border border-slate-800 hover:border-red-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_45px_rgba(220,38,38,0.05)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer relative overflow-hidden"
          >
            {/* Hover glow background blob */}
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-red-600/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${f.iconBg} group-hover:scale-110 transition-transform duration-300`}>
              {f.icon}
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2.5 group-hover:text-red-500 transition-colors">{f.title}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FeatureCards;
