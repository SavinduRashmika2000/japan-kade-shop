import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Clock, PiggyBank, PenTool } from 'lucide-react';

const reasons = [
  {
    icon: <UserCheck className="w-10 h-10 text-white" />,
    title: 'Genuine Parts',
    desc: 'We stock only high-quality, authentic spare parts from trusted manufacturers.'
  },
  {
    icon: <Clock className="w-10 h-10 text-white" />,
    title: 'Fast Delivery',
    desc: 'Get your parts when you need them. We offer rapid shipping and pickup options.'
  },
  {
    icon: <PiggyBank className="w-10 h-10 text-white" />,
    title: 'Competitive Prices',
    desc: 'Top-tier auto parts at the best market rates, ensuring value for money.'
  },
  {
    icon: <PenTool className="w-10 h-10 text-white" />,
    title: 'Expert Guidance',
    desc: 'Our specialists are ready to help you identify the perfect part for your vehicle.'
  }
];

const WhyChooseUs = () => {
  return (
    <section id="why-choose-us" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-50 rounded-[3rem] my-12">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">