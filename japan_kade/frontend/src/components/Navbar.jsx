import React, { useState, useEffect } from 'react';
import { Menu, X, Car } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 backdrop-blur-md shadow-sm py-4'
        : 'bg-white py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-600 text-white">
              <Car className="w-6 h-6" />
            </div>
            <div className="leading-none">
              <div className="text-xl font-bold text-slate-900 tracking-tight">Mind Spare Parts</div>
            </div>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-base font-medium text-slate-600 hover:text-blue-600 transition-colors">Home</a>
            <a href="#about" className="text-base font-medium text-slate-600 hover:text-blue-600 transition-colors">About Us</a>
            <a href="#contact" className="text-base font-medium text-slate-600 hover:text-blue-600 transition-colors">Contact</a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-6">
            <a href="/login" className="premium-btn-3d">
              <span className="premium-btn-inner">
                <span className="premium-btn-text">Login</span>
              </span>
            </a>
            <a href="#contact" className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
              Contact Us
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-slate-100 py-6 px-6 flex flex-col gap-5">
          <a href="#home" className="text-lg font-medium text-slate-700 hover:text-blue-600" onClick={() => setIsOpen(false)}>Home</a>
          <a href="#about" className="text-lg font-medium text-slate-700 hover:text-blue-600" onClick={() => setIsOpen(false)}>About Us</a>
          <a href="#contact" className="text-lg font-medium text-slate-700 hover:text-blue-600" onClick={() => setIsOpen(false)}>Contact</a>
          <hr className="border-slate-100 my-2" />
          <div className="flex justify-center">
            <a href="/login" className="premium-btn-3d w-full text-center">
              <span className="premium-btn-inner">
                <span className="premium-btn-text">Login</span>
              </span>
            </a>
          </div>
          <a href="#contact" className="w-full text-center py-4 text-base font-bold text-white bg-blue-600 rounded-full shadow-md">
            Contact Us
          </a>
        </div>
      )}

      {/* Premium Glassmorphism 3D Button Styles */}
      <style>{`
        .premium-btn-3d {
          position: relative;
          display: inline-block;
          padding: 2px; /* Border thickness */
          border-radius: 12px;
          background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%);
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2);
          cursor: pointer;
        }

        .premium-btn-inner {
          display: block;
          padding: 8px 24px;
          border-radius: 10px;
          background: #ffffff;
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          z-index: 1;
        }

        .premium-btn-text {
          font-size: 0.875rem;
          font-weight: 700;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          transition: all 0.3s ease;
        }

        /* Hover State */
        .premium-btn-3d:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 25px rgba(37, 99, 235, 0.3);
        }

        .premium-btn-3d:hover .premium-btn-inner {
          background: transparent;
        }

        .premium-btn-3d:hover .premium-btn-text {
          -webkit-text-fill-color: #ffffff;
        }