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