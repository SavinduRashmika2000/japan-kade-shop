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
  {
    icon: <Package className="w-7 h-7 text-orange-500" />,
    iconBg: 'bg-orange-50 dark:bg-orange-900/30',
    title: 'Inventory Management',
    desc: 'Track spare parts, manage stock levels, get low stock alerts and never run out of essentials.',
  },
  {
    icon: <UserCircle className="w-7 h-7 text-purple-600" />,
    iconBg: 'bg-purple-50 dark:bg-purple-900/30',
    title: 'Staff Management',
    desc: 'Manage staff roles, schedules, performance and payroll efficiently.',
  },
  {
    icon: <Receipt className="w-7 h-7 text-pink-600" />,
    iconBg: 'bg-pink-50 dark:bg-pink-900/30',
    title: 'Billing & Invoicing',