import React, { useState, useEffect } from 'react';
import { Menu, X, Car, Search, Phone, ChevronRight, ShoppingBag, MapPin, Grid } from 'lucide-react';
import { BRANDING } from '../config/branding';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-[#0F172A] shadow-lg py-3 border-b border-white/5'
        : 'bg-[#0F172A] py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ================= DESKTOP NAVBAR ================= */}
        <div className="hidden md:flex justify-between items-center gap-6">
          
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#DC2626] text-white shadow-md">
              <Car className="w-6 h-6 transform -rotate-12" />
            </div>
            <div className="leading-none">
              <div className="text-xl font-extrabold text-white tracking-tight font-heading">{BRANDING.name}</div>
              <div className="text-[9px] text-[#F59E0B] font-bold uppercase tracking-widest mt-0.5">Automotive Imports</div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6 text-sm font-semibold text-white">
            <a href="#home" className="hover:text-[#DC2626] transition-colors">Home</a>
            <a href="#about" className="hover:text-[#DC2626] transition-colors">About Us</a>
            <a href="#contact" className="hover:text-[#DC2626] transition-colors">Contact</a>
          </div>

          {/* Contact Quick Action + Login */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Quick Contact Action */}
            <a 
              href={`tel:${BRANDING.phone}`} 
              className="hidden lg:flex items-center gap-2 text-slate-300 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
            >
              <Phone className="w-4 h-4 text-[#F59E0B]" />
              <span>{BRANDING.phone}</span>
            </a>
            
            <a href="/login" className="px-5 py-2.5 text-xs font-extrabold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all border border-slate-700">
              Login Portal
            </a>
            
            <a href="#contact" className="px-5 py-2.5 text-xs font-extrabold text-white bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg transition-all shadow-md">
              Order Inquiry
            </a>
          </div>

        </div>

        {/* ================= MOBILE NAVBAR (Compact Top Bar) ================= */}
        <div className="md:hidden flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#DC2626] text-white">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black text-white font-heading">{BRANDING.name}</div>
            </div>
          </div>

          {/* Trigger */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="p-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-800 hover:text-white"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* ================= MOBILE NAVIGATION DRAWER (Slide-out dedicated menu) ================= */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-[#0F172A]/98 backdrop-blur-lg flex flex-col pt-24 px-6 gap-6 transition-all duration-300">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-widest">Navigation Center</span>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Large touch navigation links */}
          <div className="flex flex-col gap-3">
            <a 
              href="#home" 
              className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl text-lg font-bold text-white hover:bg-slate-900 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span>Home</span>
              <ChevronRight className="w-5 h-5 text-[#DC2626]" />
            </a>
            
            <a 
              href="#about" 
              className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl text-lg font-bold text-white hover:bg-slate-900 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span>About Us</span>
              <ChevronRight className="w-5 h-5 text-[#DC2626]" />
            </a>
            
            <a 
              href="#contact" 
              className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl text-lg font-bold text-white hover:bg-slate-900 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span>Contact</span>
              <ChevronRight className="w-5 h-5 text-[#DC2626]" />
            </a>
          </div>

          <hr className="border-slate-800 my-2" />

          {/* Quick contact and portals (Thumb-friendly bottom region) */}
          <div className="flex flex-col gap-4 mt-auto pb-10">
            <a 
              href={`tel:${BRANDING.phone}`}
              className="flex items-center justify-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl text-white font-extrabold"
            >
              <Phone className="w-5 h-5 text-[#F59E0B]" />
              {BRANDING.phone}
            </a>
            
            <div className="grid grid-cols-2 gap-4">
              <a 
                href="/login" 
                className="py-4 text-center text-sm font-bold text-white bg-slate-850 rounded-xl border border-slate-800"
                onClick={() => setIsOpen(false)}
              >
                Login Portal
              </a>
              <a 
                href="#contact" 
                className="py-4 text-center text-sm font-bold text-white bg-[#DC2626] rounded-xl"
                onClick={() => setIsOpen(false)}
              >
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
