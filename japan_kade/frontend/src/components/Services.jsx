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
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
          Part Categories
        </h2>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          We stock a comprehensive range of spare parts for all vehicle systems and models.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dbServices.length === 0 ? (
            <div className="col-span-full py-20 text-center font-bold text-slate-400">Our service catalog is currently being updated. Please check back soon!</div>
          ) : dbServices.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-300">
                <Wrench className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{s.name}</h3>
              <p className="text-slate-500 leading-relaxed text-lg mb-8 flex-1">{s.description || 'High-quality parts for your vehicle\'s maintenance and repair.'}</p>
              
              <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</span>