import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section id="home" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[90vh] flex items-center">
      <div className="grid lg:grid-cols-2 gap-16 items-center w-full">

        {/* LEFT SIDE */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="z-10"
        >
          <div className="flex items-center gap-3 text-sm font-bold tracking-widest uppercase text-blue-600 mb-6">
            <span className="w-12 h-0.5 bg-blue-600"></span>
            Mind Spare Parts
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] text-slate-900 mb-6 tracking-tight">
            High-Quality<br />
            Auto Parts You<br />
            Can <span className="text-blue-600">Trust.</span>
          </h1>

          <p className="text-slate-500 text-xl leading-relaxed mb-10 max-w-lg">
            Fast, reliable, and premium auto spare parts to keep your vehicle in top condition.
          </p>

          <div className="flex flex-wrap items-center gap-5 mb-12">
            <a href="#contact" className="flex items-center justify-center gap-2 px-8 py-4 rounded-full text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-1 transition-all w-full sm:w-auto">
              Contact Us <ArrowRight className="w-5 h-5" />
            </a>
            <a href="/login" className="flex items-center justify-center px-8 py-4 rounded-full text-lg font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all w-full sm:w-auto">
              View Your Bills
            </a>
          </div>

          <div className="flex items-center gap-6 text-sm font-semibold text-slate-600">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Fast</div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Reliable</div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Affordable</div>
          </div>
        </motion.div>

        {/* RIGHT SIDE */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative lg:h-[650px] flex items-center justify-center"
        >
          {/* Main Image */}
          <div className="relative w-full h-full min-h-[400px] rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 to-transparent z-10 mix-blend-overlay"></div>
            <img 
              src="/hero-mechanic.png" 
              alt="Professional Mechanic Working" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Floating Trust Cards */}
            <div className="absolute top-8 left-8 z-20 animate-[float_6s_ease-in-out_infinite]">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">10,000+ Parts</div>
                  <div className="text-xs font-medium text-slate-500">Always in stock</div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-16 right-8 z-20 animate-[float_7s_ease-in-out_infinite_reverse]">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Genuine OEM Parts</div>
                  <div className="text-xs font-medium text-slate-500">Quality guaranteed</div>
                </div>
              </div>
            </div>

            <div className="absolute top-1/2 -right-6 z-20 animate-[float_5s_ease-in-out_infinite]">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl px-6 py-3 shadow-xl border border-slate-100">
                <div className="font-bold text-blue-600">Affordable Pricing</div>
              </div>
            </div>
          </div>
          
        </motion.div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
      `}} />
    </section>
  );
};

export default Hero;
