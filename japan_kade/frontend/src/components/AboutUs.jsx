import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Heart } from 'lucide-react';

const AboutUs = () => {
  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 tracking-tighter">
            About Mind Spare Parts
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed mb-8 font-medium">
            Since our inception, we've been dedicated to providing high-quality automotive spare parts. We combine 
            <span className="text-blue-600 font-bold"> an extensive inventory</span> with 