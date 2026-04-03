"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { InputField, TextareaField, SelectField } from '@/components/form-field';
import { motion } from 'framer-motion';

const sidebarItems = [
  { label: 'Dashboard', href: '/club/dashboard' },
  { label: 'My Events', href: '/club/events', active: true },
  { label: 'Create Event', href: '/club/create-event' },
  { label: 'Leadership', href: '/club/team' },
  { label: 'Settings', href: '/club/settings' },
];

const categoryOptions = ['Technical', 'Sports', 'Cultural', 'Entrepreneurship', 'Other'];

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.eventId as string;

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any | null>(null);
  const [venues, setVenues] = useState<any[]>([]);

  const [form, setForm] = useState<any>({
    title: '',
    description: '',
    eventType: '',
    categories: [] as string[],
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    registrationDeadline: '',
    venueId: '',
    maxParticipants: '',
    minTeamMembers: '',
    maxTeamMembers: '',
    fee: '',
  });

  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFilename, setSelectedFilename] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!eventId) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/club/events/${eventId}`);
        if (res.status === 401) {
          toast.error('Unauthorized');
          router.push('/club/dashboard');
          return;
        }
        if (res.status === 404) {
          setEvent(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        const evt = data.event;
        setEvent(evt || null);

        if (evt) {
          // prefill form fields (convert dates to yyyy-mm-dd)
          const toDateInput = (d: any) => {
            if (!d) return '';
            const dt = new Date(d);
            return dt.toISOString().slice(0, 10);
          };

          setForm({
            title: evt.title || '',
            description: evt.description || '',
            eventType: evt.event_type || '',
            categories: Array.isArray(evt.categories) ? evt.categories : [],
            startDate: toDateInput(evt.date),
            endDate: toDateInput(evt.end_date),
            startTime: evt.start_time || '',
            endTime: evt.end_time || '',
            registrationDeadline: evt.registration_deadline ? new Date(evt.registration_deadline).toISOString().slice(0, 10) : '',
            venueId: evt.allocated_resource_id?._id || evt.allocated_resource_id || '',
            maxParticipants: String(evt.max_participants || ''),
            minTeamMembers: String(evt.min_team_members || ''),
            maxTeamMembers: String(evt.max_team_members || ''),
            fee: evt.fee || '',
          });
          // set initial preview to existing poster if available
          setPreviewUrl(evt.poster_url || null);
        }

        // fetch venues list
        const vres = await fetch('/api/admin/venues');
        if (vres.ok) {
          const vdata = await vres.json();
          setVenues(vdata.allVenues || vdata.data || []);
        }
      } catch (err) {
        console.error('Load event error', err);
        toast.error('Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [eventId, router]);

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const toggleCategory = (cat: string) => {
    setForm((prev: any) => {
      const curr: string[] = Array.isArray(prev.categories) ? prev.categories : [];
      const exists = curr.includes(cat);
      return { ...prev, categories: exists ? curr.filter((c) => c !== cat) : [...curr, cat] };
    });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title || form.title.trim().length < 3) errs.title = 'Title must be at least 3 characters';
    if (!form.description || form.description.trim().length < 10) errs.description = 'Description must be at least 10 characters';
    if (!form.startDate) errs.startDate = 'Start date is required';
    else {
      const sd = new Date(form.startDate);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (sd < today) errs.startDate = 'Date cannot be in the past';
    }
    const maxCap = Number(form.maxParticipants);
    if (!form.maxParticipants || !Number.isFinite(maxCap) || maxCap < 1) errs.maxParticipants = 'Capacity must be at least 1';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!event) return;
    if (event.status && event.status !== 'PENDING' && event.status !== 'pending') {
      toast.error('This event cannot be edited');
      return;
    }

    setSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('title', form.title);
      payload.append('description', form.description);
      payload.append('eventType', form.eventType || 'INDIVIDUAL');
      payload.append('date', form.startDate);
      payload.append('endDate', form.endDate);
      payload.append('startTime', form.startTime);
      payload.append('endTime', form.endTime);
      payload.append('registrationDeadline', form.registrationDeadline);
      payload.append('venueType', form.venueId || '');
      payload.append('maxParticipants', String(form.maxParticipants));
      payload.append('minTeamMembers', String(form.minTeamMembers || ''));
      payload.append('maxTeamMembers', String(form.maxTeamMembers || ''));
      payload.append('categories', JSON.stringify(form.categories || []));
      if (posterFile) payload.append('poster', posterFile);

      const res = await fetch(`/api/club/events/${eventId}`, {
        method: 'PATCH',
        body: payload,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json?.error || 'Failed to update event');
        setSubmitting(false);
        return;
      }

      toast.success('Event updated successfully! Redirecting...');
      setTimeout(() => router.push('/club/dashboard'), 1500);
    } catch (err) {
      console.error('Update error', err);
      toast.error('Failed to update event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F9FA]">
        <Navbar title="Edit Event" userRole="club" />
        <Sidebar items={sidebarItems} />
        <div className="md:ml-64 pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1E26] mx-auto"></div>
            <p className="mt-4 text-[#666666]">Loading event...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-[#F8F9FA]">
        <Navbar title="Edit Event" userRole="club" />
        <Sidebar items={sidebarItems} />
        <div className="md:ml-64 pt-20 max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-xl p-8 border border-[#E8E8E8] text-center">
            <h2 className="text-2xl font-bold mb-4">Event not found</h2>
            <button onClick={() => router.push('/club/dashboard')} className="px-4 py-2 bg-[#8B1E26] text-white rounded">Back to Dashboard</button>
          </div>
        </div>
      </main>
    );
  }

  // If not pending, disallow editing
  if (event.status && event.status !== 'PENDING' && event.status !== 'pending') {
    return (
      <main className="min-h-screen bg-[#F8F9FA]">
        <Navbar title="Edit Event" userRole="club" />
        <Sidebar items={sidebarItems} />
        <div className="md:ml-64 pt-20 max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-xl p-8 border border-[#E8E8E8] text-center">
            <h2 className="text-2xl font-bold mb-4">This event cannot be edited</h2>
            <p className="text-[#666666] mb-4">This event has already been approved or cancelled.</p>
            <button onClick={() => router.push('/club/dashboard')} className="px-4 py-2 bg-[#8B1E26] text-white rounded">Back to Dashboard</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <Navbar title="Edit Event" userRole="club" showBackButton={true} onBackClick={() => router.push('/club/dashboard')} />
      <Sidebar items={sidebarItems} />

      <div className="md:ml-64 pt-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-3xl font-bold">Edit Event</h1>
            <p className="text-[#666666]">Only pending events can be edited.</p>
          </motion.div>

          <motion.div className="bg-white rounded-xl border border-[#E8E8E8] p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField label="Event Title" value={form.title} onChange={(e) => handleChange('title', e.target.value)} required error={errors.title} />

              <TextareaField label="Event Description" value={form.description} onChange={(e) => handleChange('description', e.target.value)} required error={errors.description} rows={5} />

              <SelectField label="Event Type" value={form.eventType} onChange={(e) => handleChange('eventType', e.target.value)} options={[{ value: 'INDIVIDUAL', label: 'Individual' }, { value: 'TEAM', label: 'Team' }]} />

              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-2">Event Categories</label>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((cat) => {
                    const selected = Array.isArray(form.categories) && form.categories.includes(cat);
                    return (
                      <button key={cat} type="button" onClick={() => toggleCategory(cat)} className={`px-3 py-1.5 rounded-full border text-sm ${selected ? 'bg-[#8B1E26] text-white border-[#8B1E26]' : 'bg-white text-[#2D2D2D] border-[#E8E8E8]'}`}>
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <InputField type="date" label="Start Date" value={form.startDate} onChange={(e) => handleChange('startDate', e.target.value)} required error={errors.startDate} />
                <InputField type="date" label="End Date" value={form.endDate} onChange={(e) => handleChange('endDate', e.target.value)} min={form.startDate || undefined} />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <InputField type="time" label="Start Time" value={form.startTime} onChange={(e) => handleChange('startTime', e.target.value)} />
                <InputField type="time" label="End Time" value={form.endTime} onChange={(e) => handleChange('endTime', e.target.value)} />
              </div>

              <InputField type="date" label="Registration Deadline" value={form.registrationDeadline} onChange={(e) => handleChange('registrationDeadline', e.target.value)} />

              <SelectField label="Venue" value={form.venueId} onChange={(e) => handleChange('venueId', e.target.value)} options={venues.map(v => ({ value: v._id, label: v.name }))} />

              <InputField type="number" label="Capacity" value={form.maxParticipants} onChange={(e) => handleChange('maxParticipants', e.target.value)} min="1" required error={errors.maxParticipants} />

              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-2">Event Banner</label>
                {/* Hidden native input */}
                <input
                  ref={(el) => { fileInputRef.current = el; }}
                  type="file"
                  accept="image/png, image/jpeg"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    if (!f) return;
                    // limit size optionally could be validated elsewhere
                    setPosterFile(f);
                    setSelectedFilename(f.name);
                    // create local preview
                    try {
                      const url = URL.createObjectURL(f);
                      setPreviewUrl(url);
                    } catch (err) {
                      console.warn('Preview creation failed', err);
                      setPreviewUrl(null);
                    }
                  }}
                />

                {/* Preview (either selected file or existing event image) */}
                {previewUrl ? (
                  <div className="mb-3">
                    <img src={previewUrl} alt="preview" className="rounded-lg object-cover max-h-48 w-full" />
                  </div>
                ) : event.poster_url ? (
                  <div className="mb-3">
                    <img src={event.poster_url} alt="poster" className="rounded-lg object-cover max-h-48 w-full" />
                  </div>
                ) : null}

                <div
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#9B1C1C] hover:bg-red-50 transition-colors"
                >
                  <p className="text-lg">📁 Click to upload new image</p>
                  <p className="text-sm text-gray-400">PNG, JPG up to 5MB</p>
                </div>

                {selectedFilename && (
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-sm text-gray-500">Selected: {selectedFilename}</p>
                    <button
                      type="button"
                      onClick={() => {
                        // remove selected file and revert to original image
                        if (previewUrl && posterFile) {
                          try { URL.revokeObjectURL(previewUrl); } catch {}
                        }
                        setPosterFile(null);
                        setSelectedFilename('');
                        setPreviewUrl(event.poster_url || null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-[#9B1C1C] hover:text-[#7f1414] font-medium"
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4">
                <button type="button" onClick={() => router.push('/club/dashboard')} className="px-6 py-2 rounded border border-[#E8E8E8]">Cancel</button>
                <button type="submit" disabled={submitting} className={`px-6 py-2 rounded font-bold text-white ${submitting ? 'bg-gray-400' : 'bg-[#8B1E26]'}`}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
