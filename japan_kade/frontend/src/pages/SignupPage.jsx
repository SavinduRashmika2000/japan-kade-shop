import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Phone, Lock, User as UserIcon, ArrowRight, Loader2, Mail, ChevronRight, Eye, EyeOff, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import loginBg from '../assets/login-bg-light.png';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    password: '',
    idNo: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // Only allow numbers and limit to 10 digits
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: cleaned });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.phone.length !== 10) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    setLoading(true);
    try {
      await signup(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute top-0 left-0 w-full h-full z-0"
      >
        <img src={loginBg} alt="background" className="w-full h-full object-cover opacity-40 blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/40 to-transparent" />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl px-4 my-10"
      >
        <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] p-10 md:p-12">
          
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold transition-colors group">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                <ChevronRight className="w-4 h-4 rotate-180" />
              </div>
              <span className="text-sm">Back to Home</span>
            </Link>
          </motion.div>

          <div className="flex flex-col items-center mb-10">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mb-6 shadow-xl shadow-blue-600/20 cursor-pointer"
            >
              <Car className="w-8 h-8 text-white" />