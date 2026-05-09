import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section id="home" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[90vh] flex items-center">
      <div className="grid lg:grid-cols-2 gap-16 items-center w-full">

        {/* LEFT SIDE */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="z-10"
        >
          <div className="flex items-center gap-3 text-sm font-bold tracking-widest uppercase text-blue-600 mb-6">
            <span className="w-12 h-0.5 bg-blue-600"></span>
            Mind Spare Parts
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] text-slate-900 mb-6 tracking-tight">
            High-Quality<br />