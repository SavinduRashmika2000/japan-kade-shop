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