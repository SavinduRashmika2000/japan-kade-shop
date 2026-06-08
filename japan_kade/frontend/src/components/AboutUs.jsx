import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Heart } from 'lucide-react';
import { BRANDING } from '../config/branding';

const AboutUs = () => {
  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100 dark:border-slate-800/80">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white mb-8 tracking-tighter uppercase" style={{ color: '#000000' }}>
            About {BRANDING.name}
          </h2>
          <p className="text-xl leading-relaxed mb-8 font-semibold text-black" style={{ color: '#000000' }}>
            Since our inception, we've been dedicated to providing high-end automotive spare parts. We combine 
            <span className="text-red-500 font-bold"> an extensive inventory</span> with 
            expert engineering knowledge to ensure you find exactly what your vehicle demands.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 dark:bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-black" style={{ color: '#000000' }}>Genuine Parts</h4>
                <p className="text-sm font-semibold text-black" style={{ color: '#000000' }}>Every part is sourced from trusted manufacturers.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-black" style={{ color: '#000000' }}>Expert Support</h4>
                <p className="text-sm font-semibold text-black" style={{ color: '#000000' }}>We help you find the perfect part for your car.</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Outer glowing border */}
          <div className="bg-gradient-to-r from-[#DC2626]/40 to-amber-500/25 p-[1px] rounded-[3rem]">
            <div className="bg-slate-900 rounded-[3rem] p-12 text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-red-600/10 rounded-full blur-3xl group-hover:bg-red-600/20 transition-all duration-700 pointer-events-none" />
              <h3 className="text-3xl font-black mb-6 tracking-tight uppercase">Our Commitment</h3>
              <p className="text-slate-300 leading-relaxed text-lg mb-8 font-medium">
                We understand that your vehicle is an essential part of your daily operations. That's why we 
                prioritize absolute quality, stock availability, and expedited delivery for every order.
              </p>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-4xl font-black">15+</p>
                  <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest mt-1">Years Experience</p>
                </div>
                <div className="w-px h-12 bg-slate-800" />
                <div>
                  <p className="text-4xl font-black">10k+</p>
                  <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1">Happy Clients</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutUs;
