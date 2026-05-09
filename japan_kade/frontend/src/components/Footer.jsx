import { Car, Globe, Share2, MessageCircle, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-600 text-white">
                <Car className="w-6 h-6" />
              </div>
              <div className="text-xl font-bold text-white tracking-tight">Mind Spare Parts</div>
            </div>
            <p className="text-slate-400 leading-relaxed mb-8">
              Trusted automotive parts for every journey. Premium quality, genuine brands, and competitive prices.
            </p>