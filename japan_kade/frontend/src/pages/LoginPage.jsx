import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Phone, Lock, User as UserIcon, ArrowRight, Loader2, Shield, ChevronRight, Eye, EyeOff, CreditCard, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import loginBg from '../assets/login-bg-light.png';

const LoginPage = () => {
  const [isCustomer, setIsCustomer] = useState(true);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Password Recovery States
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [recoveryForm, setRecoveryForm] = useState({ phone: '', idNo: '', newPassword: '', confirmPassword: '' });
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  
  const { login, verifyRecovery, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(identifier, password);
      if (user.roles.includes('ROLE_ADMIN')) navigate('/admin');
      else if (user.roles.includes('ROLE_STAFF')) navigate('/staff');
      else navigate('/customer');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoveryChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setRecoveryForm({ ...recoveryForm, [name]: cleaned });
    } else {
      setRecoveryForm({ ...recoveryForm, [name]: value });
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoveryLoading(true);
    try {
      await verifyRecovery(recoveryForm.phone, recoveryForm.idNo);
      setRecoveryStep(2);
    } catch (err) {
      console.error('Recovery verification error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Verification failed. Please check your details.';
      setRecoveryError(msg);
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setRecoveryError('');
    if (recoveryForm.newPassword !== recoveryForm.confirmPassword) {
      setRecoveryError('Passwords do not match!');
      return;
    }
    setRecoveryLoading(true);
    try {
      await resetPassword(recoveryForm.phone, recoveryForm.idNo, recoveryForm.newPassword);
      setRecoverySuccess(true);
    } catch (err) {
      setRecoveryError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const closeRecovery = () => {
    setShowRecovery(false);
    setRecoveryStep(1);
    setRecoveryForm({ phone: '', idNo: '', newPassword: '', confirmPassword: '' });
    setRecoveryError('');
    setRecoverySuccess(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans">
      {/* Decorative Background Elements with Elegant Premium Blur */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 z-0 overflow-hidden"
      >
        <img 
          src={loginBg} 
          alt="premium background" 
          className="w-full h-full object-cover opacity-75 blur-[12px] scale-[1.08] select-none pointer-events-none" 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-white/20 to-transparent" />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-4"
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

          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Security Portal</h1>
              <p className="text-slate-500 mt-2 font-medium italic">Identity Verification & Access</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 rotate-3">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Premium Role Toggle */}
          <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-10">
            <button 
              onClick={() => setIsCustomer(true)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${isCustomer ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Customer
            </button>
            <button 
              onClick={() => setIsCustomer(false)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${!isCustomer ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Staff / Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                  {isCustomer ? 'Phone Number' : 'Corporate Username'}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    {isCustomer ? <Phone className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                  </div>
                  <input 
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => {