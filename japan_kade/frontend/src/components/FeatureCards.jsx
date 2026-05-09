import React from 'react';
import { motion } from 'framer-motion';
import { Users, Wrench, Package, UserCircle, Receipt, BarChart2 } from 'lucide-react';

const features = [
  {
    icon: <Users className="w-7 h-7 text-blue-600" />,
    iconBg: 'bg-blue-50 dark:bg-blue-900/30',
    title: 'Customer Management',
    desc: 'Manage customer profiles, vehicles, service history and communication in one place.',
  },
  {
    icon: <Wrench className="w-7 h-7 text-green-600" />,
    iconBg: 'bg-green-50 dark:bg-green-900/30',
    title: 'Inventory Management',
    desc: 'Track stock levels, manage batches, and ensure availability across all your part categories.',
  },