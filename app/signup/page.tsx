'use client';

import React from "react"
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, User, Code, BookOpen, Calendar } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rollNumber: '',
    department: '',
    batch: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.rollNumber.trim()) newErrors.rollNumber = 'Roll number is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.batch) newErrors.batch = 'Batch/Year is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setSignupError('');

    try {
      const response = await fetch('/api/auth/student-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          roll_number: formData.rollNumber,
          department: formData.department,
          batch: formData.batch,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data?.error || 'Signup failed';
        toast.error(errorMsg);
        setSignupError(errorMsg);
        setIsLoading(false);
        return;
      }

      toast.success('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login?role=student');
      }, 1500);
    } catch (error) {
      console.error('Signup failed:', error);
      const errorMsg = 'Signup failed. Please try again.';
      toast.error(errorMsg);
      setSignupError(errorMsg);
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#8B1E26] via-[#8B1E26] to-[#6B1520] flex items-center justify-center p-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">V-Sphere</h1>
          <p className="text-white/80">College Event Management</p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-[#8B1E26] to-[#6B1520] p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-2">Student Sign Up</h2>
            <p className="text-white/80 text-sm">Discover events, register, and manage your registrations</p>
          </motion.div>

          {/* Form Content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8"
          >
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Name Input */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B1E26]" size={20} />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#8B1E26] focus:border-transparent transition-all ${
                      errors.name ? 'border-[#D32F2F]' : ''
                    }`}
                  />
                </div>
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-[#D32F2F]"
                  >
                    {errors.name}
                  </motion.p>
                )}
              </motion.div>

              {/* Email Input */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B1E26]" size={20} />
                  <input
                    type="email"
                    placeholder="your.email@college.edu"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#8B1E26] focus:border-transparent transition-all ${
                      errors.email ? 'border-[#D32F2F]' : ''
                    }`}
                  />
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-[#D32F2F]"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </motion.div>

              {/* Roll Number Input */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
                  Roll Number
                </label>
                <div className="relative">
                  <Code className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B1E26]" size={20} />
                  <input
                    type="text"
                    placeholder="2023001"
                    value={formData.rollNumber}
                    onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#8B1E26] focus:border-transparent transition-all ${
                      errors.rollNumber ? 'border-[#D32F2F]' : ''
                    }`}
                  />
                </div>
                {errors.rollNumber && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-[#D32F2F]"
                  >
                    {errors.rollNumber}
                  </motion.p>
                )}
              </motion.div>

              {/* Department and Batch Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Department Input */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
                    Department
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B1E26]" size={20} />
                    <select
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26] focus:border-transparent transition-all appearance-none ${
                        errors.department ? 'border-[#D32F2F]' : ''
                      }`}
                    >
                      <option value="">Select Department</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Civil">Civil</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  {errors.department && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-[#D32F2F]"
                    >
                      {errors.department}
                    </motion.p>
                  )}
                </motion.div>

                {/* Batch Input */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
                    Batch/Year
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B1E26]" size={20} />
                    <select
                      value={formData.batch}
                      onChange={(e) => handleInputChange('batch', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B1E26] focus:border-transparent transition-all appearance-none ${
                        errors.batch ? 'border-[#D32F2F]' : ''
                      }`}
                    >
                      <option value="">Select Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                  {errors.batch && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-[#D32F2F]"
                    >
                      {errors.batch}
                    </motion.p>
                  )}
                </motion.div>
              </div>

              {/* Password Input */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B1E26]" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full pl-10 pr-12 py-2.5 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#8B1E26] focus:border-transparent transition-all ${
                      errors.password ? 'border-[#D32F2F]' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#666666] hover:text-[#8B1E26]"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-[#D32F2F]"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </motion.div>

              {/* Confirm Password Input */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B1E26]" size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full pl-10 pr-12 py-2.5 border border-[#E8E8E8] rounded-lg bg-white text-[#2D2D2D] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#8B1E26] focus:border-transparent transition-all ${
                      errors.confirmPassword ? 'border-[#D32F2F]' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#666666] hover:text-[#8B1E26]"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-[#D32F2F]"
                  >
                    {errors.confirmPassword}
                  </motion.p>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                type="submit"
                className="w-full bg-gradient-to-r from-[#8B1E26] to-[#6B1520] text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </motion.button>
              {signupError && (
                <p className="text-sm text-[#D32F2F] text-center">{signupError}</p>
              )}
            </form>

            {/* Login Link */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center text-[#666666] mt-6"
            >
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login?role=student')}
                className="text-[#8B1E26] hover:underline font-bold"
              >
                Login here
              </button>
            </motion.p>

            {/* Back to Home */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              onClick={() => router.push('/')}
              className="w-full mt-4 px-4 py-2 text-center text-[#8B1E26] hover:bg-[#F8F9FA] rounded-lg transition-colors font-medium"
            >
              ← Back to Home
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </main>
  );
}
