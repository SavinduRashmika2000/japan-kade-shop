import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const Contact = () => {
  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
          Visit Us Today
        </h2>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          We're conveniently located and ready to serve you.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Contact Info */}
        <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-xl">
          <div className="space-y-10">
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">Our Location</h4>
                <p className="text-slate-500 leading-relaxed text-lg">
                  123 Auto Avenue, Motor City<br />
                  New York, NY 10001
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <div>