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