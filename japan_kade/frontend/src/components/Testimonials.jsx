import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Rajesh Kumar",
    shop: "RK Auto Parts",
    image: "https://i.pravatar.cc/150?img=11",
    text: "Since switching to Mind Spare Parts, I no longer stay late to tally up pending payments. The inventory tracking is seamless, and my customers love the fast delivery times."
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
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-50 dark:bg-slate-900 rounded-3xl my-10">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-[#111827] dark:text-white mb-4">
          Trusted by Automotive Professionals
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
          Don't just take our word for it. See what real spare parts retailers have to say.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 relative"
          >
            <div className="flex items-center gap-1 mb-6">
              {[...Array(5)].map((_, idx) => (
                <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-slate-600 dark:text-slate-300 italic mb-8">"{t.text}"</p>
            <div className="flex items-center gap-4 mt-auto">
              <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full" />
              <div>
                <h4 className="font-bold text-[#111827] dark:text-white text-sm">{t.name}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs">{t.shop}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
