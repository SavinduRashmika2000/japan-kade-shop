import React from 'react';
import { Phone, Calendar } from 'lucide-react';
import { BRANDING } from '../config/branding';

const CallToAction = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Outer wrapper for gradient border glow */}
      <div className="bg-gradient-to-r from-[#DC2626]/40 via-amber-500/20 to-[#DC2626]/40 p-[1px] rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
          {/* Background glow / blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
          
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-[0.25em] mb-6">
              Get Started Today
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tighter uppercase leading-tight">
              Upgrade to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DC2626] to-[#F59E0B]">{BRANDING.name}</span>
            </h2>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
              Join thousands of retailers who trust our premium Japanese vehicle parts, tools, and smart digital systems.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <a 
                href="#contact" 
                className="relative overflow-hidden group bg-gradient-to-r from-[#DC2626] to-red-700 text-white font-bold px-8 py-4.5 rounded-2xl text-base shadow-[0_4px_20px_rgba(220,38,38,0.25)] hover:shadow-[0_4px_25px_rgba(220,38,38,0.45)] hover:scale-[1.02] transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-2.5"
              >
                {/* Shimmer effect */}
                <span className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-[shimmer_0.8s_ease-out]" />
                <Calendar className="w-5 h-5 shrink-0" /> 
                <span>Inquire Now</span>
              </a>
              <a 
                href={`tel:${BRANDING.phone.replace(/\s+/g, '')}`} 
                className="bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white font-bold px-8 py-4.5 rounded-2xl text-base transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-2.5 border border-slate-800 hover:border-slate-700"
              >
                <Phone className="w-5 h-5 shrink-0" /> 
                <span>Call {BRANDING.phone}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
