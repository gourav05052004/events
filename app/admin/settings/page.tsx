'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { InputField, SelectField, TextareaField } from '@/components/form-field';
import {
  Settings,
  Bell,
  Lock,
  Globe,
  Mail,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Events', href: '/admin/events' },
  { label: 'Clubs', href: '/admin/clubs' },
  { label: 'Venues', href: '/admin/venues' },
  { label: 'Activity Logs', href: '/admin/logs' },
  { label: 'Settings', href: '/admin/settings', active: true },
];

export default function AdminSettings() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'system' | 'notifications' | 'security' | 'email'>('system');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [showPassword, setShowPassword] = useState(false);

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    platformName: 'V-Sphere',
    platformDescription: 'College Event & Resource Management System',
    timezone: 'UTC+5:30 (IST)',
    defaultEventCapacity: '100',
    maintenanceMode: false,
    enableRegistrations: true,
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailOnEventApproval: true,
    emailOnClubRegistration: true,
    emailOnVenueConfirmation: true,
    emailOnUserActivation: true,
    emailDigestFrequency: 'weekly',
    notifyAdminOnRejection: true,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: '30',
    passwordMinLength: '8',
    requireSpecialChars: true,
    twoFactorEnabled: true,
    apiKeyRotationDays: '90',
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    senderEmail: 'noreply@vsphere.edu',
    senderName: 'V-Sphere Admin',
    emailUsername: '',
    emailPassword: '',
  });

  const handleSave = async () => {
    setSaveStatus('saving');
    // Simulate API call
    setTimeout(() => {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 1000);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  const tabs = [
    { id: 'system', label: 'System Settings', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'email', label: 'Email Configuration', icon: Mail },
  ];

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <Navbar title="Settings" userRole="admin" />
      <Sidebar
        items={sidebarItems}
        onLogout={() => router.push('/')}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="md:ml-64 pt-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-[#8B1E26] rounded-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#2D2D2D]">System Settings</h1>
                <p className="text-[#666666]">Configure platform settings and preferences</p>
              </div>
            </div>
          </motion.div>

          {/* Save Status Alert */}
          {saveStatus !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                saveStatus === 'success'
                  ? 'bg-[#10B981] bg-opacity-10 border border-[#10B981]'
                  : saveStatus === 'error'
                    ? 'bg-[#D32F2F] bg-opacity-10 border border-[#D32F2F]'
                    : 'bg-[#FFC107] bg-opacity-10 border border-[#FFC107]'
              }`}
            >
              {saveStatus === 'success' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-[#10B981]" />
                  <span className="text-[#10B981] font-medium">Settings saved successfully!</span>
                </>
              ) : saveStatus === 'error' ? (
                <>
                  <AlertCircle className="w-5 h-5 text-[#D32F2F]" />
                  <span className="text-[#D32F2F] font-medium">Error saving settings. Please try again.</span>
                </>
              ) : (
                <>
                  <div className="w-5 h-5 border-2 border-[#FFC107] border-t-transparent rounded-full animate-spin" />
                  <span className="text-[#FFC107] font-medium">Saving settings...</span>
                </>
              )}
            </motion.div>
          )}

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 border-b border-[#E8E8E8]"
          >
            <div className="flex gap-4 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap transition-colors relative ${
                      activeTab === tab.id
                        ? 'text-[#8B1E26]'
                        : 'text-[#666666] hover:text-[#2D2D2D]'
                    }`}
                    whileHover={{ y: -2 }}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-[#8B1E26]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-xl border border-[#E8E8E8] p-8"
          >
            {/* System Settings Tab */}
            {activeTab === 'system' && (
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
                <motion.div variants={item}>
                  <h3 className="text-lg font-semibold text-[#2D2D2D] mb-4">Platform Configuration</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <InputField
                      label="Platform Name"
                      value={systemSettings.platformName}
                      onChange={(e) =>
                        setSystemSettings({ ...systemSettings, platformName: e.target.value })
                      }
                    />
                    <InputField
                      label="Default Event Capacity"
                      type="number"
                      value={systemSettings.defaultEventCapacity}
                      onChange={(e) =>
                        setSystemSettings({ ...systemSettings, defaultEventCapacity: e.target.value })
                      }
                    />
                    <SelectField
                      label="Timezone"
                      value={systemSettings.timezone}
                      onChange={(e) =>
                        setSystemSettings({ ...systemSettings, timezone: e.target.value })
                      }
                      options={[
                        { value: 'UTC+5:30 (IST)', label: 'UTC+5:30 (IST)' },
                        { value: 'UTC', label: 'UTC' },
                        { value: 'UTC+1 (CET)', label: 'UTC+1 (CET)' },
                        { value: 'UTC-5 (EST)', label: 'UTC-5 (EST)' },
                      ]}
                    />
                    <div />
                  </div>
                </motion.div>

                <motion.div variants={item} className="border-t border-[#E8E8E8] pt-6">
                  <h3 className="text-lg font-semibold text-[#2D2D2D] mb-4">Feature Controls</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-[#E8E8E8] rounded-lg hover:bg-[#F8F9FA] transition-colors">
                      <div>
                        <p className="font-medium text-[#2D2D2D]">Enable Event Registrations</p>
                        <p className="text-sm text-[#666666]">Allow students to register for events</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={systemSettings.enableRegistrations}
                        onChange={(e) =>
                          setSystemSettings({ ...systemSettings, enableRegistrations: e.target.checked })
                        }
                        className="w-5 h-5 rounded cursor-pointer accent-[#8B1E26]"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-[#E8E8E8] rounded-lg hover:bg-[#F8F9FA] transition-colors">
                      <div>
                        <p className="font-medium text-[#2D2D2D]">Maintenance Mode</p>
                        <p className="text-sm text-[#666666]">Temporarily disable the platform for maintenance</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={systemSettings.maintenanceMode}
                        onChange={(e) =>
                          setSystemSettings({ ...systemSettings, maintenanceMode: e.target.checked })
                        }
                        className="w-5 h-5 rounded cursor-pointer accent-[#8B1E26]"
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={item}>
                  <TextareaField
                    label="Platform Description"
                    value={systemSettings.platformDescription}
                    onChange={(e) =>
                      setSystemSettings({ ...systemSettings, platformDescription: e.target.value })
                    }
                    placeholder="Enter platform description"
                    rows={4}
                  />
                </motion.div>
              </motion.div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
                <motion.div variants={item}>
                  <h3 className="text-lg font-semibold text-[#2D2D2D] mb-4">Email Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border border-[#E8E8E8] rounded-lg hover:bg-[#F8F9FA] transition-colors">
                      <div>
                        <p className="font-medium text-[#2D2D2D]">Event Approval Notifications</p>
                        <p className="text-sm text-[#666666]">Notify clubs when events are approved</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailOnEventApproval}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            emailOnEventApproval: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded cursor-pointer accent-[#8B1E26]"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-[#E8E8E8] rounded-lg hover:bg-[#F8F9FA] transition-colors">
                      <div>
                        <p className="font-medium text-[#2D2D2D]">Club Registration Notifications</p>
                        <p className="text-sm text-[#666666]">Notify admins on new club registrations</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailOnClubRegistration}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            emailOnClubRegistration: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded cursor-pointer accent-[#8B1E26]"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-[#E8E8E8] rounded-lg hover:bg-[#F8F9FA] transition-colors">
                      <div>
                        <p className="font-medium text-[#2D2D2D]">Venue Confirmation Notifications</p>
                        <p className="text-sm text-[#666666]">Notify clubs when venue is confirmed</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailOnVenueConfirmation}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            emailOnVenueConfirmation: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded cursor-pointer accent-[#8B1E26]"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-[#E8E8E8] rounded-lg hover:bg-[#F8F9FA] transition-colors">
                      <div>
                        <p className="font-medium text-[#2D2D2D]">User Activation Notifications</p>
                        <p className="text-sm text-[#666666]">Send welcome emails to new users</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailOnUserActivation}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            emailOnUserActivation: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded cursor-pointer accent-[#8B1E26]"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-[#E8E8E8] rounded-lg hover:bg-[#F8F9FA] transition-colors">
                      <div>
                        <p className="font-medium text-[#2D2D2D]">Admin Rejection Notifications</p>
                        <p className="text-sm text-[#666666]">Notify admins when events are rejected</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.notifyAdminOnRejection}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            notifyAdminOnRejection: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded cursor-pointer accent-[#8B1E26]"
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={item} className="border-t border-[#E8E8E8] pt-6">
                  <SelectField
                    label="Email Digest Frequency"
                    value={notificationSettings.emailDigestFrequency}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        emailDigestFrequency: e.target.value,
                      })
                    }
                    options={[
                      { value: 'daily', label: 'Daily' },
                      { value: 'weekly', label: 'Weekly' },
                      { value: 'monthly', label: 'Monthly' },
                    ]}
                  />
                </motion.div>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
                <motion.div variants={item}>
                  <h3 className="text-lg font-semibold text-[#2D2D2D] mb-4">Security Policies</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <InputField
                      label="Session Timeout (minutes)"
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) =>
                        setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })
                      }
                    />
                    <InputField
                      label="Minimum Password Length"
                      type="number"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) =>
                        setSecuritySettings({ ...securitySettings, passwordMinLength: e.target.value })
                      }
                    />
                    <InputField
                      label="API Key Rotation (days)"
                      type="number"
                      value={securitySettings.apiKeyRotationDays}
                      onChange={(e) =>
                        setSecuritySettings({ ...securitySettings, apiKeyRotationDays: e.target.value })
                      }
                    />
                    <div />
                  </div>
                </motion.div>

                <motion.div variants={item} className="border-t border-[#E8E8E8] pt-6">
                  <h3 className="text-lg font-semibold text-[#2D2D2D] mb-4">Security Features</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border border-[#E8E8E8] rounded-lg hover:bg-[#F8F9FA] transition-colors">
                      <div>
                        <p className="font-medium text-[#2D2D2D]">Require Special Characters in Passwords</p>
                        <p className="text-sm text-[#666666]">Enforce strong password requirements</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={securitySettings.requireSpecialChars}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            requireSpecialChars: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded cursor-pointer accent-[#8B1E26]"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-[#E8E8E8] rounded-lg hover:bg-[#F8F9FA] transition-colors">
                      <div>
                        <p className="font-medium text-[#2D2D2D]">Two-Factor Authentication</p>
                        <p className="text-sm text-[#666666]">Require 2FA for admin accounts</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={securitySettings.twoFactorEnabled}
                        onChange={(e) =>
                          setSecuritySettings({ ...securitySettings, twoFactorEnabled: e.target.checked })
                        }
                        className="w-5 h-5 rounded cursor-pointer accent-[#8B1E26]"
                      />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Email Configuration Tab */}
            {activeTab === 'email' && (
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
                <motion.div variants={item}>
                  <h3 className="text-lg font-semibold text-[#2D2D2D] mb-4">SMTP Configuration</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <InputField
                      label="SMTP Host"
                      value={emailSettings.smtpHost}
                      onChange={(e) =>
                        setEmailSettings({ ...emailSettings, smtpHost: e.target.value })
                      }
                      placeholder="e.g., smtp.gmail.com"
                    />
                    <InputField
                      label="SMTP Port"
                      type="number"
                      value={emailSettings.smtpPort}
                      onChange={(e) =>
                        setEmailSettings({ ...emailSettings, smtpPort: e.target.value })
                      }
                      placeholder="e.g., 587"
                    />
                    <InputField
                      label="Sender Email"
                      type="email"
                      value={emailSettings.senderEmail}
                      onChange={(e) =>
                        setEmailSettings({ ...emailSettings, senderEmail: e.target.value })
                      }
                      placeholder="noreply@vsphere.edu"
                    />
                    <InputField
                      label="Sender Name"
                      value={emailSettings.senderName}
                      onChange={(e) =>
                        setEmailSettings({ ...emailSettings, senderName: e.target.value })
                      }
                      placeholder="V-Sphere Admin"
                    />
                    <InputField
                      label="SMTP Username"
                      value={emailSettings.emailUsername}
                      onChange={(e) =>
                        setEmailSettings({ ...emailSettings, emailUsername: e.target.value })
                      }
                      placeholder="Your SMTP username"
                    />
                    <div className="relative">
                      <InputField
                        label="SMTP Password"
                        type={showPassword ? 'text' : 'password'}
                        value={emailSettings.emailPassword}
                        onChange={(e) =>
                          setEmailSettings({ ...emailSettings, emailPassword: e.target.value })
                        }
                        placeholder="Your SMTP password"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-10 text-[#666666] hover:text-[#2D2D2D] transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={item} className="border-t border-[#E8E8E8] pt-6">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-[#8B1E26] text-white rounded-lg hover:bg-[#6B1620] transition-colors font-medium"
                  >
                    Test Email Configuration
                  </button>
                  <p className="text-sm text-[#666666] mt-2">
                    Send a test email to verify SMTP configuration is working correctly
                  </p>
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex justify-end"
          >
            <motion.button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-8 py-3 bg-[#8B1E26] text-white rounded-lg hover:bg-[#6B1620] disabled:opacity-50 transition-all font-semibold shadow-md hover:shadow-lg"
            >
              <Save className="w-5 h-5" />
              {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
