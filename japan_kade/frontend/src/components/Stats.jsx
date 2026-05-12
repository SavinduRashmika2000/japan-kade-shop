import React from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle2, Package, IndianRupee } from 'lucide-react';

const stats = [
  { value: '1,250+', label: 'Happy Customers', icon: <Users className="w-6 h-6 text-blue-600" />, iconBg: 'bg-blue-100 dark:bg-blue-900/40' },
  { value: '3,450+', label: 'Orders Fulfilled', icon: <CheckCircle2 className="w-6 h-6 text-green-600" />, iconBg: 'bg-green-100 dark:bg-green-900/40' },
  { value: '2,800+', label: 'Parts Managed', icon: <Package className="w-6 h-6 text-orange-500" />, iconBg: 'bg-orange-100 dark:bg-orange-900/40' },
  { value: '₹12.5L+', label: 'Revenue Generated', icon: <IndianRupee className="w-6 h-6 text-purple-600" />, iconBg: 'bg-purple-100 dark:bg-purple-900/40' },
];

const Stats = () => {
  return (
    <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #111827 0%, #1e3a8a 100%)' }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/10">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex items-center gap-4 px-8 py-8"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${stat.iconBg}`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-extrabold text-white leading-tight">{stat.value}</div>