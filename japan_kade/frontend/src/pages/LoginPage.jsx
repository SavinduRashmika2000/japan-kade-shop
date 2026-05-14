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
                      const val = e.target.value;
                      if (isCustomer) {
                        setIdentifier(val.replace(/\D/g, '').slice(0, 10));
                      } else {
                        setIdentifier(val);
                      }
                    }}
                    maxLength={isCustomer ? "10" : undefined}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all placeholder:text-slate-300"
                    placeholder={isCustomer ? "0712345678" : "admin_official"}
                  />
                </div>
              </div>


              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500">Access Key</label>
                  {isCustomer && (
                    <button 
                      type="button"
                      onClick={() => setShowRecovery(true)}
                      className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      Recovery
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-12 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all placeholder:text-slate-300"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border border-red-100 text-red-600 text-sm py-3 px-5 rounded-xl font-bold overflow-hidden"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-blue-600 disabled:opacity-50 text-white font-black py-4.5 px-6 rounded-[1.5rem] flex items-center justify-center gap-3 transition-all duration-300 shadow-xl shadow-slate-900/10"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Sign In <ArrowRight className="w-5 h-5" /></>}
            </motion.button>
          </form>

          {isCustomer && (
            <p className="text-center text-slate-500 mt-10 text-sm font-bold">
              New customer? <Link to="/signup" className="text-blue-600 hover:underline underline-offset-4 ml-1">Create Account</Link>
            </p>
          )}
        </div>
      </motion.div>

      {/* Recovery Modal */}
      <AnimatePresence>
        {showRecovery && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl"
              onClick={closeRecovery}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative z-10 w-full max-w-lg bg-white rounded-[3rem] shadow-2xl border border-white p-8 md:p-12 overflow-hidden"
            >
              <button 
                onClick={closeRecovery}
                className="absolute top-8 right-8 text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-6 shadow-inner">
                  {recoveryStep === 1 ? <Shield className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                  {recoveryStep === 1 ? "Identity Verification" : "New Access Key"}
                </h3>
                <p className="text-slate-500 mt-2 font-medium">
                  {recoveryStep === 1 
                    ? "Enter your registered phone and ID to proceed." 
                    : "Create a strong new password for your account."}
                </p>
              </div>

              {recoveryStep === 1 ? (
                <form onSubmit={handleVerify} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Phone Number</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <Phone className="w-5 h-5" />
                      </div>
                      <input 
                        type="text" name="phone" required
                        value={recoveryForm.phone} onChange={handleRecoveryChange}
                        maxLength="10"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all placeholder:text-slate-300"
                        placeholder="0712345678"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Identity Card Number (NIC)</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <input 
                        type="text" name="idNo" required
                        value={recoveryForm.idNo} onChange={handleRecoveryChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all placeholder:text-slate-300"
                        placeholder="199512345678"
                      />
                    </div>
                  </div>

                  {recoveryError && (
                    <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100">{recoveryError}</p>
                  )}

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={recoveryLoading}
                    className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-4.5 rounded-2xl transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3"
                  >
                    {recoveryLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Verify Identity <ChevronRight className="w-5 h-5" /></>}
                  </motion.button>
                </form>
              ) : (
                <form onSubmit={handleReset} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">New Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input 
                        type="password" name="newPassword" required
                        value={recoveryForm.newPassword} onChange={handleRecoveryChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all placeholder:text-slate-300"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Confirm New Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input 
                        type="password" name="confirmPassword" required
                        value={recoveryForm.confirmPassword} onChange={handleRecoveryChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all placeholder:text-slate-300"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {recoveryError && (
                    <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100">{recoveryError}</p>
                  )}

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={recoveryLoading}
                    className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-black py-4.5 rounded-2xl transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3"
                  >
                    {recoveryLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Update Access Key <ArrowRight className="w-5 h-5" /></>}
                  </motion.button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Popup */}
      <AnimatePresence>
        {recoverySuccess && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center border border-slate-100"
            >
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Password Reset</h3>
              <p className="text-slate-500 mt-3 font-bold">Your access credentials have been updated successfully. Please log in with your new key.</p>
              <button 
                onClick={closeRecovery}
                className="w-full mt-8 bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-emerald-600 transition-all shadow-lg"
              >
                OK, Back to Login
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginPage;

