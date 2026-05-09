import React from 'react';
import { motion } from 'framer-motion';
import { Users, Wrench, Package, UserCircle, Receipt, BarChart2 } from 'lucide-react';

const features = [
  {
    icon: <Users className="w-7 h-7 text-blue-600" />,
    iconBg: 'bg-blue-50 dark:bg-blue-900/30',
    title: 'Customer Management',
    desc: 'Manage customer profiles, vehicles, service history and communication in one place.',
  },
  {
    icon: <Wrench className="w-7 h-7 text-green-600" />,
    iconBg: 'bg-green-50 dark:bg-green-900/30',
    title: 'Inventory Management',
    desc: 'Track stock levels, manage batches, and ensure availability across all your part categories.',
  },
  {
    icon: <Package className="w-7 h-7 text-orange-500" />,
    iconBg: 'bg-orange-50 dark:bg-orange-900/30',
    title: 'Inventory Management',
    desc: 'Track spare parts, manage stock levels, get low stock alerts and never run out of essentials.',
  },
  {
    icon: <UserCircle className="w-7 h-7 text-purple-600" />,
    iconBg: 'bg-purple-50 dark:bg-purple-900/30',
    title: 'Staff Management',
    desc: 'Manage staff roles, schedules, performance and payroll efficiently.',
  },
  {
    icon: <Receipt className="w-7 h-7 text-pink-600" />,
    iconBg: 'bg-pink-50 dark:bg-pink-900/30',
    title: 'Billing & Invoicing',
    desc: 'Generate invoices, track payments, manage discounts and get paid faster.',
  },
  {
    icon: <BarChart2 className="w-7 h-7 text-teal-600" />,
    iconBg: 'bg-teal-50 dark:bg-teal-900/30',
    title: 'Reports & Analytics',
    desc: 'Get insights into your business with detailed reports and beautiful analytics.',
  },
];

const FeatureCards = () => {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <p className="text-blue-600 font-semibold tracking-widest uppercase text-xs mb-3">Powerful Features</p>
        <h2 className="text-3xl md:text-4xl font-bold text-[#111827] dark:text-white mb-4">
          Everything You Need to Manage<br className="hidden md:block" /> Your Spare Parts Business
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
          Powerful tools to streamline operations and deliver quality parts faster.
        </p>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}