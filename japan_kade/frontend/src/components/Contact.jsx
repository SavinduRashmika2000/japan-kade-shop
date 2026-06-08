import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { BRANDING } from '../config/branding';

const Contact = () => {
  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter uppercase">
          Visit Us Today
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
          We're conveniently located in Colombo and ready to fulfill your premium vehicle parts requirements.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-stretch">
        {/* Contact Info Card */}
        <div className="bg-slate-100/90 dark:bg-slate-900/80 rounded-[3rem] p-10 md:p-12 border border-slate-200 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.25)] flex flex-col justify-center">
          <div className="space-y-10">
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-sm text-red-500">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Our Location</h4>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-base md:text-lg font-bold">
                  {BRANDING.address}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-sm text-amber-500">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Call Us</h4>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-base md:text-lg font-bold">
                  {BRANDING.phone}<br />
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Mon-Sat: 8:00 AM - 6:00 PM</span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-sm text-red-500">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Email Us</h4>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-base md:text-lg font-bold break-all">
                  {BRANDING.email}<br />
                  {BRANDING.supportEmail}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Mock/Visual */}
        <div className="w-full min-h-[350px] md:min-h-[400px] rounded-[3rem] overflow-hidden bg-slate-950 relative border border-slate-800 shadow-lg group">
          {/* Stylized Dark Grid Pattern Map */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 z-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-20">
            <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mb-4 animate-bounce">
              <MapPin className="w-8 h-8 text-red-500" />
            </div>
            <h5 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">Katubedda Road, Colombo</h5>
            <p className="text-slate-400 text-sm max-w-sm font-medium">
              Visit our state-of-the-art Japanese Import Showroom & Logistics Hub.
            </p>
            <a 
              href="https://maps.google.com" 
              target="_blank" 
              rel="noreferrer" 
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-black uppercase tracking-wider transition-all duration-300 hover:bg-slate-850 hover:border-slate-700"
            >
              Get Directions
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
