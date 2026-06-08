import React from 'react';
import { motion } from 'framer-motion';

const VisualTrust = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative w-full h-[500px] md:h-[640px] rounded-[3rem] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.4)] flex items-center justify-center"
      >
        {/* Layered Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/90 via-[#0F172A]/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-transparent to-transparent z-10" />

        {/* Background Image */}
        <img
          src="/garage-trust.png"
          alt="Premium Japanese Automotive Workshop"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />

        {/* Red glow accent */}
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-red-600/20 rounded-full blur-3xl z-10 pointer-events-none" />

        {/* Content */}
        <div className="relative z-20 text-left px-10 md:px-20 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-600/20 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            Trusted Workshop Partner
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tighter leading-tight uppercase">
            Premium Parts.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DC2626] to-[#F59E0B]">
              Peak Performance.
            </span>
          </h2>
          <p className="text-slate-300 text-lg md:text-xl leading-relaxed max-w-xl font-medium mb-8">
            Every part we stock is vetted, authentic, and backed by Japanese manufacturing standards.
          </p>
          <div className="flex gap-8">
            <div>
              <p className="text-3xl font-black text-white">15+</p>
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mt-1">Years Active</p>
            </div>
            <div className="w-px bg-slate-700" />
            <div>
              <p className="text-3xl font-black text-white">8,000+</p>
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mt-1">Parts in Stock</p>
            </div>
            <div className="w-px bg-slate-700" />
            <div>
              <p className="text-3xl font-black text-white">100%</p>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1">OEM Genuine</p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default VisualTrust;
