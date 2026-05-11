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