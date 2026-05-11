import React from 'react';
import { motion } from 'framer-motion';
import { Droplet, Wrench, Settings2, Disc, Sparkles, BatteryCharging, Clock } from 'lucide-react';
import serviceTypeService from '../services/serviceTypeService';

const Services = () => {
  const [dbServices, setDbServices] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await serviceTypeService.getAllServiceTypes();
        setDbServices(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch services", err);
      } finally {
        setLoading(false);
      }
    };