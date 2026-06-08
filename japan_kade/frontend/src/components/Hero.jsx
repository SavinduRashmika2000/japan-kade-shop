import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Settings, Wrench, Award, ChevronRight, CornerDownRight, Zap, Target } from 'lucide-react';
import { BRANDING } from '../config/branding';

const Hero = () => {
  // Staggered entrance animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 16
      }
    }
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        delay: 0.6
      }
    }
  };

  return (
    <section id="home" className="relative pt-32 pb-24 md:pt-40 md:pb-36 bg-[#0F172A] overflow-hidden">
      {/* Background Grid Pattern with Premium Dark Fade */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.07]" style={{
        backgroundImage: 'radial-gradient(#DC2626 1.5px, transparent 1.5px)',
        backgroundSize: '32px 32px'
      }} />
      
      {/* Neon Gradient Blobs */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-red-600/10 blur-[120px] pointer-events-none animate-pulse duration-[6000ms]" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          
          {/* LEFT SIDE - Premium Content Block */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-6 text-left"
          >
            {/* Japanese Import Badge */}
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-lg bg-slate-900/90 text-white font-bold text-xs uppercase tracking-[0.25em] mb-8 border border-red-500/30 shadow-md backdrop-blur-sm"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#DC2626]"></span>
              </span>
              Genuine Japanese Imports
            </motion.div>

            {/* Rebranded Heading with Dramatic Split entrance */}
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-[4.2rem] font-black text-white leading-[1.05] tracking-tighter mb-6 uppercase"
            >
              Precision Driven.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DC2626] to-[#F59E0B] drop-shadow-sm">Japanese</span> Quality<br />
              Parts & Tools.
            </motion.h1>

            {/* Description Text */}
            <motion.div 
              variants={itemVariants}
              className="flex items-start gap-4 text-slate-400 text-lg md:text-xl leading-relaxed mb-10 max-w-lg"
            >
              <CornerDownRight className="w-6 h-6 text-[#F59E0B] shrink-0 mt-1" />
              <p className="font-medium">
                Your premier destination for heavy duty mechanical components, precision workshop gear, and imported Japanese hand tools.
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-12"
            >
              <a 
                href="#contact" 
                className="group flex items-center justify-center gap-2 px-8 py-5 rounded-xl text-base font-black uppercase tracking-widest text-white bg-[#DC2626] hover:bg-[#B91C1C] transition-all duration-300 shadow-xl shadow-red-600/25 relative overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                <span className="relative z-10 flex items-center gap-2">
                  Inquire Parts <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
              <a 
                href="/login" 
                className="flex items-center justify-center px-8 py-5 rounded-xl text-base font-black uppercase tracking-widest text-white bg-slate-900 border border-slate-700/80 hover:border-slate-400/80 hover:bg-slate-800 transition-all duration-300 shadow-lg"
              >
                Access Portal
              </a>
            </motion.div>

            {/* Stats Block */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-3 gap-6 border-t border-slate-800/80 pt-8"
            >
              <div className="flex flex-col">
                <span className="text-3xl font-black text-white tracking-tight">100%</span>
                <span className="text-[10px] font-black text-[#F59E0B] uppercase tracking-widest mt-1">OEM Certified</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-white tracking-tight">Direct</span>
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1">Tokyo Import</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-white tracking-tight">24/7</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Fast Dispatch</span>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE - Layered Visual Layout with Glowing Effects */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            {/* Pulsing Backlight */}
            <div className="absolute -inset-1.5 rounded-[2.5rem] bg-gradient-to-r from-red-600 via-amber-500 to-red-600 opacity-20 blur-xl animate-pulse duration-[4000ms]" />

            {/* Main Image Container */}
            <motion.div
              variants={badgeVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ rotateY: -3, rotateX: 3, scale: 1.01 }}
              className="relative w-full aspect-[4/3] sm:aspect-square md:max-w-xl lg:max-w-none rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-700/50 bg-slate-950 group z-10 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent z-10 opacity-80" />
              <img 
                src="/hero-car.png" 
                alt="Premium Japanese Sports Vehicle" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-105"
              />
              
              {/* Bottom Info Ribbon with glowing badge */}
              <div className="absolute bottom-6 left-6 right-6 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black text-[#F59E0B] uppercase tracking-widest">Premium Workshop Stock</div>
                  <div className="text-base font-bold text-white mt-1 uppercase tracking-tight">JAPAN KADE Parts Hub</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white font-black shadow-lg shadow-red-600/30">
                  JP
                </div>
              </div>
            </motion.div>

            {/* Next-Level Floating Badge 1 */}
            <div className="absolute -top-8 -left-8 z-30 bg-slate-900/95 border border-slate-800/80 shadow-2xl rounded-2xl p-4 flex items-center gap-3 animate-[floatPremium_7s_ease-in-out_infinite] backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                <Settings className="w-5 h-5 animate-[spin_10s_linear_infinite]" />
              </div>
              <div>
                <div className="font-black text-xs text-white uppercase tracking-wider">Precision Fit</div>
                <div className="text-[9px] text-[#F59E0B] font-bold uppercase tracking-widest mt-0.5">JDM Standard</div>
              </div>
            </div>

            {/* Next-Level Floating Badge 2 */}
            <div className="absolute -bottom-8 -right-4 z-30 bg-slate-900/95 border border-slate-800/80 shadow-2xl rounded-2xl p-4 flex items-center gap-3 animate-[floatPremium_9s_ease-in-out_infinite_reverse] backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="font-black text-xs text-white uppercase tracking-wider">Genuine Imports</div>
                <div className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest mt-0.5">Full Warranty</div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatPremium {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-16px) rotate(1.5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
      `}} />
    </section>
  );
};

export default Hero;
