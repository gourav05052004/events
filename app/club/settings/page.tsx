'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { InputField, SelectField, TextareaField } from '@/components/form-field';
import toast from 'react-hot-toast';
import {
  Settings,
  Building2,
  Shield,
  Save,
  CheckCircle,
  AlertCircle,
  Loader,
} from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', href: '/club/dashboard' },
  { label: 'My Events', href: '/club/events' },
  { label: 'Create Event', href: '/club/create-event' },
  { label: 'Team', href: '/club/team' },
  { label: 'Settings', href: '/club/settings', active: true },
];

type SaveState = 'idle' | 'saving' | 'success' | 'error';

type ActiveTab = 'profile' | 'security';

export default function ClubSettingsPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  const [saveStatus, setSaveStatus] = useState<SaveState>('idle');
  const [isLoading, setIsLoading] = useState(true);

  const [profileSettings, setProfileSettings] = useState({
    clubName: '',
    email: '',
    facultyCoordinator: '',
    department: '',
    description: '',
  });

  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const resolveClubId = async () => {
    const storedClubId = window.localStorage.getItem('clubId');
    if (storedClubId) {
      return storedClubId;
    }

    try {
      const response = await fetch('/api/club/me');
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const clubId = data?.club?.id;
      if (clubId) {
        window.localStorage.setItem('clubId', clubId);
        return clubId as string;
      }
    } catch (error) {
      console.error('Failed to resolve club ID:', error);
    }

    return null;
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const clubId = await resolveClubId();
    if (!clubId) {
      setIsLoading(false);
      toast.error('Session expired. Please login again.');
      router.push('/login?role=club');
      return;
    }

    try {
      const response = await fetch(`/api/club/settings?clubId=${clubId}`);
      if (response.ok) {
        const result = await response.json();
        setProfileSettings(result.data);
      } else {
        toast.error('Failed to load settings');
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    const clubId = await resolveClubId();
    if (!clubId) {
      toast.error('Session expired. Please login again.');
      router.push('/login?role=club');
      return;
    }

    setSaveStatus('saving');

    try {
      // Save profile settings
      if (activeTab === 'profile') {
        const response = await fetch('/api/club/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clubId,
            type: 'profile',
            ...profileSettings,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save profile settings');
        }

        const result = await response.json();
        setProfileSettings(result.data);
        setSaveStatus('success');
        toast.success('Profile updated successfully');
      }
      // Save security settings (password)
      else if (activeTab === 'security') {
        if (!securitySettings.currentPassword || !securitySettings.newPassword) {
          setSaveStatus('error');
          toast.error('Please fill in all password fields');
          setTimeout(() => setSaveStatus('idle'), 2500);
          return;
        }

        if (securitySettings.newPassword !== securitySettings.confirmPassword) {
          setSaveStatus('error');
          toast.error('New passwords do not match');
          setTimeout(() => setSaveStatus('idle'), 2500);
          return;
        }

        if (securitySettings.newPassword.length < 6) {
          setSaveStatus('error');
          toast.error('Password must be at least 6 characters');
          setTimeout(() => setSaveStatus('idle'), 2500);
          return;
        }

        const response = await fetch('/api/club/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clubId,
            type: 'password',
            currentPassword: securitySettings.currentPassword,
            newPassword: securitySettings.newPassword,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update password');
        }

        setSaveStatus('success');
        toast.success('Password updated successfully');
        setSecuritySettings({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }

      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
      toast.error(error instanceof Error ? error.message : 'Failed to save settings');
      setTimeout(() => setSaveStatus('idle'), 2500);
    }
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
    { id: 'profile', label: 'Club Profile', icon: Building2 },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#F8F9FA]">
        <Navbar title="Club Settings" userRole="club" />
        <Sidebar
          items={sidebarItems}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        <div className="md:ml-64 pt-6 flex items-center justify-center h-96">
          <Loader className="w-8 h-8 text-[#8B1E26] animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <Navbar title="Club Settings" userRole="club" />
      <Sidebar
        items={sidebarItems}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="md:ml-64 pt-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
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
                <h1 className="text-3xl font-bold text-[#2D2D2D]">Club Settings</h1>
                <p className="text-[#666666]">Manage your club profile and security.</p>
              </div>
            </div>
          </motion.div>

          {saveStatus !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
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

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 border-b border-[#E8E8E8]">
            <div className="flex gap-4 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as ActiveTab)}
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
                        layoutId="activeClubTab"
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

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-[#E8E8E8] p-8"
          >
            {activeTab === 'profile' && (
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
                <motion.div variants={item}>
                  <h3 className="text-lg font-semibold text-[#2D2D2D] mb-4">Club Information</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <InputField
                      label="Club Name"
                      value={profileSettings.clubName}
                      onChange={(e) =>
                        setProfileSettings({ ...profileSettings, clubName: e.target.value })
                      }
                    />
                    <InputField
                      label="Club Email"
                      type="email"
                      value={profileSettings.email}
                      onChange={(e) =>
                        setProfileSettings({ ...profileSettings, email: e.target.value })
                      }
                    />
                    <InputField
                      label="Faculty Coordinator"
                      value={profileSettings.facultyCoordinator}
                      onChange={(e) =>
                        setProfileSettings({ ...profileSettings, facultyCoordinator: e.target.value })
                      }
                    />
                    <InputField
                      label="Department"
                      value={profileSettings.department}
                      onChange={(e) =>
                        setProfileSettings({ ...profileSettings, department: e.target.value })
                      }
                    />
                  </div>
                </motion.div>

                <motion.div variants={item}>
                  <TextareaField
                    label="Club Description"
                    value={profileSettings.description}
                    onChange={(e) =>
                      setProfileSettings({ ...profileSettings, description: e.target.value })
                    }
                    rows={4}
                  />
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
                <motion.div variants={item}>
                  <h3 className="text-lg font-semibold text-[#2D2D2D] mb-4">Password Management</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <InputField
                      label="Current Password"
                      type="password"
                      value={securitySettings.currentPassword}
                      onChange={(e) =>
                        setSecuritySettings({ ...securitySettings, currentPassword: e.target.value })
                      }
                    />
                    <InputField
                      label="New Password"
                      type="password"
                      value={securitySettings.newPassword}
                      onChange={(e) =>
                        setSecuritySettings({ ...securitySettings, newPassword: e.target.value })
                      }
                    />
                    <InputField
                      label="Confirm New Password"
                      type="password"
                      value={securitySettings.confirmPassword}
                      onChange={(e) =>
                        setSecuritySettings({ ...securitySettings, confirmPassword: e.target.value })
                      }
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          <div className="flex justify-end mt-6">
            <motion.button
              whileHover={{ scale: saveStatus === 'saving' ? 1 : 1.02 }}
              whileTap={{ scale: saveStatus === 'saving' ? 1 : 0.98 }}
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8B1E26] to-[#6B1520] text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {saveStatus === 'saving' ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </main>
  );
}
