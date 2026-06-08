import React from 'react';
import { Car, Globe, MessageCircle, Mail, Phone, MapPin, ExternalLink, ShieldAlert } from 'lucide-react';
import { BRANDING } from '../config/branding';

const Footer = () => {
  return (
    <footer className="bg-[#0F172A] text-white pt-20 pb-10 border-t border-white/5 relative overflow-hidden">
      
      {/* Subtle background industrial decor */}
      <div className="absolute right-0 bottom-0 opacity-[0.02] pointer-events-none text-[15rem] font-black tracking-tighter uppercase font-heading select-none select-none">
        KADE
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ================= DESKTOP FOOTER STRUCTURE ================= */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 border-b border-white/10 pb-16">
          
          {/* Brand & Info Column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#DC2626] text-white">
                <Car className="w-6 h-6 transform -rotate-12" />
              </div>
              <div className="text-xl font-black text-white tracking-tight font-heading">{BRANDING.name}</div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              {BRANDING.description}
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {[Globe, MessageCircle, Mail].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 hover:bg-[#DC2626] hover:border-[#DC2626] flex items-center justify-center transition-all duration-300"
                >
                  <Icon className="w-4 h-4 text-slate-300 hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-sm font-extrabold text-white uppercase tracking-widest mb-6 border-l-2 border-[#DC2626] pl-3">Quick Navigation</h4>
            <ul className="space-y-3.5 text-sm">
              {['Home', 'About Us', 'Contact'].map(link => (
                <li key={link}>
                  <a href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} className="text-slate-400 hover:text-[#DC2626] transition-colors flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5" />
                    {link}
                  </a>
                </li>
              ))}
              <li>
                <a href="/login" className="text-slate-400 hover:text-[#DC2626] transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5" />
                  Staff Login Portal
                </a>
              </li>
            </ul>
          </div>

          {/* Product Categories Column */}
          <div>
            <h4 className="text-sm font-extrabold text-white uppercase tracking-widest mb-6 border-l-2 border-[#DC2626] pl-3">Import Categories</h4>
            <ul className="space-y-3.5 text-sm">
              {[
                'Engine & Transmission Components',
                'Suspension & Shock Systems',
                'Electrical & Ignition Parts',
                'Precision Workshop Equipment',
                'Imported Japanese Hand Tools'
              ].map(link => (
                <li key={link}>
                  <a href="#about" className="text-slate-400 hover:text-[#DC2626] transition-colors flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5" />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details Column */}
          <div>
            <h4 className="text-sm font-extrabold text-white uppercase tracking-widest mb-6 border-l-2 border-[#DC2626] pl-3">Import Hub Colombo</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
                <span>{BRANDING.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#F59E0B] shrink-0" />
                <a href={`tel:${BRANDING.phone}`} className="hover:text-white transition-colors">{BRANDING.phone}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#F59E0B] shrink-0" />
                <a href={`mailto:${BRANDING.email}`} className="hover:text-white transition-colors">{BRANDING.email}</a>
              </li>
            </ul>
          </div>

        </div>

        {/* ================= MOBILE FOOTER STRUCTURE ================= */}
        <div className="md:hidden flex flex-col gap-8 mb-10 border-b border-white/10 pb-10">
          
          {/* Logo & Compact Description */}
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#DC2626] text-white mb-4">
              <Car className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black tracking-tight font-heading">{BRANDING.name}</h3>
            <p className="text-slate-400 text-xs mt-2 max-w-sm">
              Your professional partner for premium genuine Japanese vehicle parts, tools, and imports.
            </p>
          </div>

          {/* Thumb-friendly Contact shortcuts */}
          <div className="grid grid-cols-2 gap-3">
            <a 
              href={`tel:${BRANDING.phone}`} 
              className="flex flex-col items-center justify-center p-4 bg-slate-900 border border-slate-800 rounded-xl text-center hover:bg-slate-850"
            >
              <Phone className="w-5 h-5 text-[#F59E0B] mb-2" />
              <span className="text-xs font-bold text-white">Call Hub</span>
              <span className="text-[10px] text-slate-500 mt-1">{BRANDING.phone}</span>
            </a>
            
            <a 
              href={`mailto:${BRANDING.email}`}
              className="flex flex-col items-center justify-center p-4 bg-slate-900 border border-slate-800 rounded-xl text-center hover:bg-slate-850"
            >
              <Mail className="w-5 h-5 text-[#F59E0B] mb-2" />
              <span className="text-xs font-bold text-white">Email Sales</span>
              <span className="text-[10px] text-slate-500 mt-1">{BRANDING.email}</span>
            </a>
          </div>

          {/* Compact links */}
          <div className="flex justify-center gap-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <a href="#home" className="hover:text-white">Home</a>
            <span>&bull;</span>
            <a href="#about" className="hover:text-white">About Us</a>
            <span>&bull;</span>
            <a href="#contact" className="hover:text-white">Contact</a>
            <span>&bull;</span>
            <a href="/login" className="hover:text-white text-[#DC2626]">Portal</a>
          </div>

        </div>

        {/* Bottom copyright details for both */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p className="text-center md:text-left">
            &copy; {new Date().getFullYear()} {BRANDING.name}. All rights reserved. Precision Japanese Imports.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <span>|</span>
            <a href="#" className="hover:text-white">Terms of Use</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

// Internal chevron helper to prevent dependency errors
const ChevronRight = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

export default Footer;
