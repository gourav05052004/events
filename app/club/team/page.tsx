'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Mail, Phone, MapPin, Users, BadgeCheck, Edit, Save, X, Loader, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const sidebarItems = [
  { label: 'Dashboard', href: '/club/dashboard' },
  { label: 'My Events', href: '/club/events' },
  { label: 'Create Event', href: '/club/create-event' },
  { label: 'Team', href: '/club/team', active: true },
  { label: 'Settings', href: '/club/settings' },
];

interface TeamMemberData {
  name: string;
  email: string;
  phone: string;
  department: string;
  office: string;
  image: string;
}

export default function ClubTeamPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [editingMember, setEditingMember] = useState<'faculty' | 'president' | null>(null);
  
  const [facultyCoordinator, setFacultyCoordinator] = useState<TeamMemberData>({
    name: '',
    email: '',
    phone: '',
    department: '',
    office: '',
    image: '',
  });

  const [president, setPresident] = useState<TeamMemberData>({
    name: '',
    email: '',
    phone: '',
    department: '',
    office: '',
    image: '',
  });

  const [editForm, setEditForm] = useState<TeamMemberData>({
    name: '',
    email: '',
    phone: '',
    department: '',
    office: '',
    image: '',
  });

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    const clubId = window.localStorage.getItem('clubId');
    if (!clubId) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/club/team?clubId=${clubId}`);
      if (response.ok) {
        const result = await response.json();
        console.log('[fetchTeamData] Loaded team data:', result.data);
        setFacultyCoordinator(result.data.facultyCoordinator);
        setPresident(result.data.president);
      }
    } catch (error) {
      console.error('Failed to fetch team data:', error);
      toast.error('Failed to load team details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (memberType: 'faculty' | 'president') => {
    setEditingMember(memberType);
    setEditForm(memberType === 'faculty' ? facultyCoordinator : president);
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
    setEditForm({
      name: '',
      email: '',
      phone: '',
      department: '',
      office: '',
      image: '',
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const clubId = window.localStorage.getItem('clubId');
    if (!clubId) {
      toast.error('Club ID not found');
      return;
    }

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('clubId', clubId);
      formData.append('memberType', editingMember || '');

      const response = await fetch('/api/club/team', {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      
      // Update the image in edit form
      const imageUrl = editingMember === 'faculty' 
        ? result.data.facultyCoordinator.image 
        : result.data.president.image;
      
      setEditForm({ ...editForm, image: imageUrl });
      
      // Update the main state
      if (editingMember === 'faculty') {
        setFacultyCoordinator(result.data.facultyCoordinator);
      } else {
        setPresident(result.data.president);
      }
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    const clubId = window.localStorage.getItem('clubId');
    if (!clubId) {
      toast.error('Club ID not found');
      return;
    }

    setIsSaving(true);
    try {
      const updateData = editingMember === 'faculty' 
        ? { facultyCoordinator: editForm }
        : { president: editForm };

      const response = await fetch('/api/club/team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId,
          ...updateData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update team details');
      }

      const result = await response.json();
      
      console.log('[handleSave] Update successful, received data:', result.data);
      
      if (editingMember === 'faculty') {
        setFacultyCoordinator(result.data.facultyCoordinator);
        console.log('[handleSave] Updated facultyCoordinator state:', result.data.facultyCoordinator);
      } else {
        setPresident(result.data.president);
        console.log('[handleSave] Updated president state:', result.data.president);
      }

      toast.success('Team details updated successfully');
      handleCancelEdit();
    } catch (error) {
      console.error('Failed to save team details:', error);
      toast.error('Failed to save team details');
    } finally {
      setIsSaving(false);
    }
  };

  const teamMembers = [
    {
      id: 'faculty',
      data: facultyCoordinator,
      role: 'Faculty Coordinator',
    },
    {
      id: 'president',
      data: president,
      role: 'Club President',
    },
  ];

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#F8F9FA]">
        <Navbar title="Club Team" userRole="club" />
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
      <Navbar title="Club Team" userRole="club" />
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
            <h1 className="text-4xl font-bold text-[#2D2D2D] mb-2">Leadership Team</h1>
            <p className="text-[#666666]">
              Faculty coordinator and club president details for quick coordination.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-2 gap-6"
          >
            {teamMembers.map((member, index) => (
              <motion.div
                key={`${member.id}-${member.data.name}-${member.data.image}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    {/* Member Image */}
                    <div className="flex-shrink-0">
                      <div className="h-24 w-24 rounded-xl overflow-hidden border-2 border-[#E8E8E8] bg-gradient-to-br from-[#8B1E26] to-[#6B1520]">
                        {member.data.image ? (
                          <img
                            src={member.data.image}
                            alt={member.data.name || member.role}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-white text-2xl font-bold">
                            {member.data.name ? member.data.name.charAt(0).toUpperCase() : '?'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-[#8B1E26] text-sm font-semibold">
                          <BadgeCheck size={16} />
                          {member.role}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEdit(member.id as 'faculty' | 'president')}
                          className="p-2 bg-[#F8F9FA] hover:bg-[#8B1E26] hover:text-white rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </motion.button>
                      </div>

                      <h2 className="text-xl font-bold text-[#2D2D2D] mb-2">
                        {member.data.name || 'Not set'}
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-[#444444]">
                    <div className="flex items-start gap-2">
                      <Users size={16} className="text-[#8B1E26] mt-0.5 flex-shrink-0" />
                      <span>{member.data.department || 'Department not set'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail size={16} className="text-[#8B1E26] mt-0.5 flex-shrink-0" />
                      <span className="break-all">{member.data.email || 'Email not set'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone size={16} className="text-[#8B1E26] mt-0.5 flex-shrink-0" />
                      <span>{member.data.phone || 'Phone not set'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-[#8B1E26] mt-0.5 flex-shrink-0" />
                      <span>{member.data.office || 'Office not set'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-[#E8E8E8] flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#2D2D2D]">
                Edit {editingMember === 'faculty' ? 'Faculty Coordinator' : 'President'} Details
              </h2>
              <button
                onClick={handleCancelEdit}
                className="p-2 hover:bg-[#F8F9FA] rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">
                  Profile Image
                </label>
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 rounded-xl overflow-hidden border-2 border-[#E8E8E8] bg-gradient-to-br from-[#8B1E26] to-[#6B1520] flex-shrink-0">
                    {editForm.image ? (
                      <img
                        src={editForm.image}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-white text-2xl font-bold">
                        {editForm.name ? editForm.name.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={isUploadingImage}
                    />
                    <label
                      htmlFor="image-upload"
                      className={`inline-flex items-center gap-2 px-4 py-2 bg-[#F8F9FA] hover:bg-[#E8E8E8] border border-[#E8E8E8] rounded-lg cursor-pointer transition-colors ${
                        isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isUploadingImage ? (
                        <>
                          <Loader size={16} className="animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          Choose Image
                        </>
                      )}
                    </label>
                    <p className="text-xs text-[#666666] mt-2">
                      Recommended: Square image, max 2MB
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded-lg focus:ring-2 focus:ring-[#8B1E26] focus:border-transparent outline-none"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded-lg focus:ring-2 focus:ring-[#8B1E26] focus:border-transparent outline-none"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded-lg focus:ring-2 focus:ring-[#8B1E26] focus:border-transparent outline-none"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded-lg focus:ring-2 focus:ring-[#8B1E26] focus:border-transparent outline-none"
                  placeholder="Enter department"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">
                  Office Location
                </label>
                <input
                  type="text"
                  value={editForm.office}
                  onChange={(e) => setEditForm({ ...editForm, office: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded-lg focus:ring-2 focus:ring-[#8B1E26] focus:border-transparent outline-none"
                  placeholder="Enter office location"
                />
              </div>
            </div>

            <div className="p-6 border-t border-[#E8E8E8] flex gap-3 justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancelEdit}
                className="px-6 py-2 border border-[#E8E8E8] text-[#2D2D2D] rounded-lg hover:bg-[#F8F9FA] transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={isSaving || !editForm.name}
                className="px-6 py-2 bg-[#8B1E26] text-white rounded-lg hover:bg-[#6B1520] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {isSaving ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
