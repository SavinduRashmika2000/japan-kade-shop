import React from 'react';
import { motion } from 'framer-motion';
import { FilePlus, Wrench, IndianRupee } from 'lucide-react';

const steps = [
  {
    icon: <FilePlus className="w-8 h-8 text-blue-600" />,
    title: "1. Create Job Card",
    description: "Quickly log customer details, vehicle issues, and estimated costs in seconds."
  },
  {
    icon: <Wrench className="w-8 h-8 text-blue-600" />,
    title: "2. Assign & Track",
    description: "Assign mechanics to the job. Track the progress and spare parts used in real-time."
  },
  {