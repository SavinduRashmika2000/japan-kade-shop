import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

import { BRANDING } from '../config/branding';

const testimonials = [
  {
    name: "Rajesh Kumar",
    shop: "RK Auto Parts",
    image: "https://i.pravatar.cc/150?img=11",
    text: `Since switching to ${BRANDING.name}, I no longer stay late to tally up pending payments. The inventory tracking is seamless, and my customers love the fast delivery times.`
  },
  {
    name: "Amit Patel",
    shop: "Patel Garage Works",
    image: "https://i.pravatar.cc/150?img=12",
    text: "Inventory management was a nightmare before. Now I know exactly what parts are in stock and when to order. It has saved us thousands in lost inventory."
  },
  {
    name: "Suresh Menon",
    shop: "Speedy Spares",
    image: "https://i.pravatar.cc/150?img=15",
    text: "The best investment for my shop. The dashboard gives me a clear picture of my sales trends and stock levels. Highly recommended for any serious business owner."
  }
];

const Testimonials = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto rounded-[3rem] my-10 relative overflow-hidden bg-slate-900/30 border border-slate-800">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#DC2626]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center mb-16 relative z-10">
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter uppercase">
          Trusted by Professionals
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
          See why top spare parts retailers and workshop owners choose {BRANDING.name}.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 relative z-10">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1, type: 'spring', bounce: 0.1 }}
            className="bg-slate-900/50 hover:bg-slate-900/70 rounded-[2rem] p-8 border border-slate-800 hover:border-slate-700 transition-all duration-300 flex flex-col h-full shadow-lg group"
          >
            <div className="flex items-center gap-1.5 mb-6">
              {[...Array(5)].map((_, idx) => (
                <Star key={idx} className="w-4 h-4 fill-amber-500 text-amber-500 group-hover:scale-110 transition-transform duration-300" />
              ))}
            </div>
            <p className="text-slate-300 italic mb-8 leading-relaxed font-medium flex-1">"{t.text}"</p>
            
            <div className="flex items-center gap-4 pt-6 border-t border-slate-800/80 mt-auto">
              <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full border border-slate-800" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{t.name}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-0.5">{t.shop}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
