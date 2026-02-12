'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Save, Loader } from 'lucide-react';

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SettingsPage() {
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChangePassword = async () => {
    try {
      // Validation
      if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        setMessage({
          type: 'error',
          text: 'All fields are required',
        });
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        setMessage({
          type: 'error',
          text: 'New password must be at least 6 characters long',
        });
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setMessage({
          type: 'error',
          text: 'Passwords do not match',
        });
        return;
      }

      setChangingPassword(true);
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to change password');
      }

      setMessage({
        type: 'success',
        text: 'Password changed successfully',
      });

      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to change password',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-[#2D2D2D] mb-2">Settings</h1>
          <p className="text-[#666666] mb-8">Change your admin password</p>
        </motion.div>

        {/* Messages */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{message.text}</span>
          </motion.div>
        )}

        {/* Change Password Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#E8E8E8] rounded-xl p-8 shadow-sm"
        >
          <h2 className="text-2xl font-semibold text-[#2D2D2D] mb-6">Change Password</h2>
          
          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                className="w-full px-4 py-2 border border-[#E8E8E8] rounded-lg focus:ring-2 focus:ring-[#8B1E26] focus:border-transparent outline-none transition-all"
                placeholder="Enter your current password"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                className="w-full px-4 py-2 border border-[#E8E8E8] rounded-lg focus:ring-2 focus:ring-[#8B1E26] focus:border-transparent outline-none transition-all"
                placeholder="Enter your new password (minimum 6 characters)"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-2 border border-[#E8E8E8] rounded-lg focus:ring-2 focus:ring-[#8B1E26] focus:border-transparent outline-none transition-all"
                placeholder="Confirm your new password"
              />
            </div>
          </div>

          {/* Change Password Button */}
          <motion.button
            onClick={handleChangePassword}
            disabled={changingPassword}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-8 w-full flex items-center justify-center gap-2 px-8 py-3 bg-[#8B1E26] text-white rounded-lg hover:bg-[#6B1620] disabled:opacity-50 transition-all font-semibold shadow-md hover:shadow-lg"
          >
            {changingPassword ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Changing Password...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Change Password
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </main>
  );
}
