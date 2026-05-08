import React from 'react';
import { Phone, Calendar } from 'lucide-react';

const CallToAction = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-blue-600 rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl relative overflow-hidden">
        {/* Background glow / blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-700 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            Need Premium Spare Parts?
          </h2>
          <p className="text-blue-100 text-xl max-w-2xl mx-auto mb-12">
            Get in touch with us today for high-quality automotive parts you can rely on.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a href="#contact" className="bg-white text-blue-600 font-bold px-10 py-5 rounded-full text-lg hover:shadow-xl hover:scale-105 transition-all w-full sm:w-auto flex items-center justify-center gap-3">
              <Calendar className="w-6 h-6" /> Inquire Now
            </a>
            <a href="#contact" className="bg-blue-700 text-white font-bold px-10 py-5 rounded-full text-lg hover:bg-blue-800 transition-all w-full sm:w-auto flex items-center justify-center gap-3 border border-blue-500">
              <Phone className="w-6 h-6" /> Contact Sales
            </a>
          </div>