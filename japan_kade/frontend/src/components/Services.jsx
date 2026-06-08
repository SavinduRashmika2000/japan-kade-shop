import React from 'react';
import { motion } from 'framer-motion';
import { Droplet, Wrench, Settings2, Disc, Sparkles, BatteryCharging, Clock } from 'lucide-react';
import serviceTypeService from '../services/serviceTypeService';

const Services = () => {
  const [dbServices, setDbServices] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await serviceTypeService.getAllServiceTypes();
        setDbServices(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch services", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter uppercase">
          Part Categories
        </h2>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
          We stock a comprehensive range of genuine spare parts for all Japanese vehicle systems and models.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-red-650 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dbServices.length === 0 ? (
            <div className="col-span-full py-20 text-center font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Our service catalog is currently being updated. Please check back soon!</div>
          ) : dbServices.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1, type: 'spring', bounce: 0.1 }}
              className="group bg-slate-900/40 hover:bg-slate-900/60 rounded-[2rem] p-8 border border-slate-800 hover:border-red-500/25 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
            >
              {/* Card subtle neon glow */}
              <div className="absolute -right-8 -top-8 w-20 h-20 bg-red-600/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#DC2626] group-hover:text-white transition-all duration-300 text-red-500">
                <Wrench className="w-6 h-6 transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-red-500 transition-colors">{s.name}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-base mb-8 flex-1 font-medium">{s.description || 'High-quality genuine parts for your vehicle\'s maintenance and repair.'}</p>
              
              <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between mt-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest">Duration</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{s.duration} mins</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest">Base Rate</span>
                  <p className="text-2xl font-black text-[#DC2626] dark:text-[#DC2626] mt-1">Rs. {(s.basePrice || 0).toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Services;
