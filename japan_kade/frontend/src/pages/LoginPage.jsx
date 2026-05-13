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