'use client';

import React from "react"
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { InputField } from '@/components/form-field';

const roleInfo = {
  student: {
    title: 'Student Login',
    description: 'Discover events, register, and manage your registrations',
    color: 'from-blue-600',
  },
  club: {
    title: 'Club / Faculty Login',
    description: 'Create events, manage venues, and engage with the community',
    color: 'from-purple-600',
  },
  admin: {
    title: 'Admin Login',
    description: 'Oversee all events, manage resources, and monitor activities',
    color: 'from-red-600',
  },
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<'student' | 'club' | 'admin'>(
    (searchParams.get('role') as any) || 'student'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';

    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Navigate based on role
    if (role === 'student') {
      router.push('/student/dashboard');
    } else if (role === 'club') {
      router.push('/club/dashboard');
    } else {
      router.push('/admin/dashboard');
    }
  };

  const currentRole = roleInfo[role];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#8B1E26] via-[#8B1E26] to-[#6B1520] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
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
          {/* Role Selection */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-[#8B1E26] to-[#6B1520] p-6"
          >
            <p className="text-white text-sm font-medium mb-4">Select your role:</p>
            <div className="flex gap-3">
              {(['student', 'club', 'admin'] as const).map((r) => (
                <motion.button
                  key={r}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setRole(r);
                    setErrors({});
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    role === r
                      ? 'bg-white text-[#8B1E26] shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Form Content */}
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#2D2D2D] mb-2">{currentRole.title}</h2>
              <p className="text-[#666666] text-sm">{currentRole.description}</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Input - FIXED VERSION */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B1E26]" size={20} />
                  <input
                    type="email"
                    placeholder="your.email@college.edu"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors({ ...errors, email: undefined });
                    }}
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

              {/* Password Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-[#2D2D2D] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B1E26]" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors({ ...errors, password: undefined });
                    }}
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

              {/* Remember & Forgot */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-between text-sm"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-[#E8E8E8] cursor-pointer"
                  />
                  <span className="text-[#666666]">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => router.push('/forgot-password')}
                  className="text-[#8B1E26] hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                type="submit"
                className="w-full bg-gradient-to-r from-[#8B1E26] to-[#6B1520] text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </motion.button>
            </form>

            {/* Sign Up Link */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center text-[#666666] mt-6"
            >
              Don't have an account?{' '}
              <button
                onClick={() => router.push('/signup')}
                className="text-[#8B1E26] hover:underline font-bold"
              >
                Sign up now
              </button>
            </motion.p>

            {/* Back to Home */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => router.push('/')}
              className="w-full mt-4 px-4 py-2 text-center text-[#8B1E26] hover:bg-[#F8F9FA] rounded-lg transition-colors font-medium"
            >
              ← Back to Home
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Demo Credentials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white text-center text-sm"
        >
          <p className="font-medium mb-2">Demo Credentials:</p>
          <p className="text-white/80">
            Email: <span className="font-mono">demo@college.edu</span> | Password:{' '}
            <span className="font-mono">password123</span>
          </p>
        </motion.div>
      </motion.div>
    </main>
  );
}