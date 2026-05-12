import React from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle2, Package, IndianRupee } from 'lucide-react';

const stats = [
  { value: '1,250+', label: 'Happy Customers', icon: <Users className="w-6 h-6 text-blue-600" />, iconBg: 'bg-blue-100 dark:bg-blue-900/40' },
  { value: '3,450+', label: 'Orders Fulfilled', icon: <CheckCircle2 className="w-6 h-6 text-green-600" />, iconBg: 'bg-green-100 dark:bg-green-900/40' },
  { value: '2,800+', label: 'Parts Managed', icon: <Package className="w-6 h-6 text-orange-500" />, iconBg: 'bg-orange-100 dark:bg-orange-900/40' },
  { value: '₹12.5L+', label: 'Revenue Generated', icon: <IndianRupee className="w-6 h-6 text-purple-600" />, iconBg: 'bg-purple-100 dark:bg-purple-900/40' },
];

const Stats = () => {
  return (