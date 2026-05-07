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
            expert knowledge to ensure you find exactly what your vehicle needs.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Genuine Parts</h4>
                <p className="text-sm text-slate-500">Every part is sourced from trusted manufacturers.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Expert Support</h4>
                <p className="text-sm text-slate-500">We help you find the perfect part for your car.</p>