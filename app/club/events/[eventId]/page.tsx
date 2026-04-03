"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Calendar, MapPin, Users, Tag, Download } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', href: '/club/dashboard' },
  { label: 'My Events', href: '/club/events', active: true },
  { label: 'Create Event', href: '/club/create-event' },
  { label: 'Leadership', href: '/club/team' },
  { label: 'Settings', href: '/club/settings' },
];

function formatDate(iso?: string) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.eventId as string;

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any | null>(null);
  const [registrationCount, setRegistrationCount] = useState<number>(0);
  const [registrations, setRegistrations] = useState<any[]>([]);

  const exportToCSV = (rows: any[], eventName: string) => {
    if (!rows || rows.length === 0) return;
    const headers = ['Student Name', 'Email', 'Registered At', 'Status'];
    const csvRows = rows.map((reg) => [
      reg.studentName || 'Unknown',
      reg.email || '',
      new Date(reg.registeredAt).toLocaleString(),
      reg.status || 'CONFIRMED',
    ]);

    const csvContent = [headers.join(','), ...csvRows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = (eventName || 'event').replace(/\s+/g, '_');
    link.download = `${safeName}_registrations.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      try {
        setLoading(true);
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
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          toast.error(err?.error || 'Failed to load event');
          setTimeout(() => router.push('/club/dashboard'), 2000);
          return;
        }
        const data = await res.json();
        setEvent(data.event || null);
        setRegistrationCount(data.registrationCount || 0);

        // Fetch registrations
        const regRes = await fetch(`/api/club/events/${eventId}/registrations`);
        if (regRes.ok) {
          const regData = await regRes.json();
          setRegistrations(regData.registrations || []);
        }
      } catch (error) {
        console.error('Fetch event error', error);
        toast.error('Failed to load event');
        setTimeout(() => router.push('/club/dashboard'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F9FA]">
        <Navbar title="Event Details" userRole="club" />
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
        <Navbar title="Event Details" userRole="club" />
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

  const venueName = event.allocated_resource_id?.name || event.location || 'TBD';

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <Navbar title="Event Details" userRole="club" />
      <Sidebar items={sidebarItems} />

      <div className="md:ml-64 pt-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <button onClick={() => router.push('/club/dashboard')} className="text-[#8B1E26] mb-4 inline-block">← Back to Dashboard</button>

          <div className="bg-white rounded-xl overflow-hidden border border-[#E8E8E8] mb-6">
            {event.poster_url && (
              <div className="h-64 w-full overflow-hidden">
                <img src={event.poster_url} alt={event.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <h1 className="text-3xl font-bold text-[#2D2D2D]">{event.title}</h1>
                <div>
                  {event.status === 'approved' && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Approved</span>
                  )}
                  {event.status === 'pending' && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">Pending</span>
                  )}
                  {event.status === 'cancelled' && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">Cancelled</span>
                  )}
                  {event.status === 'rejected' && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">Rejected</span>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-4 bg-[#FCFCFC] p-4 rounded-lg border border-[#F0F0F0]">
                  <Calendar />
                  <div>
                    <div className="text-sm text-[#666666]">Date</div>
                    <div className="font-bold">{formatDate(event.date)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-[#FCFCFC] p-4 rounded-lg border border-[#F0F0F0]">
                  <Calendar />
                  <div>
                    <div className="text-sm text-[#666666]">Time</div>
                    <div className="font-bold">{event.start_time || ''} {event.end_time ? `- ${event.end_time}` : ''}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-[#FCFCFC] p-4 rounded-lg border border-[#F0F0F0]">
                  <MapPin />
                  <div>
                    <div className="text-sm text-[#666666]">Venue</div>
                    <div className="font-bold">{venueName}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-[#FCFCFC] p-4 rounded-lg border border-[#F0F0F0]">
                  <Users />
                  <div>
                    <div className="text-sm text-[#666666]">Capacity</div>
                    <div className="font-bold">{registrationCount}/{event.max_participants || '—'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-[#FCFCFC] p-4 rounded-lg border border-[#F0F0F0]">
                  <Tag />
                  <div>
                    <div className="text-sm text-[#666666]">Category</div>
                    <div className="font-bold">{event.event_type || ''}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-[#FCFCFC] p-4 rounded-lg border border-[#F0F0F0]">
                  <div />
                  <div>
                    <div className="text-sm text-[#666666]">Fee</div>
                    <div className="font-bold">{event.fee ? event.fee : 'Free'}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-[#555555] leading-relaxed">{event.description}</p>
              </div>
              {event.collaborating_clubs && event.collaborating_clubs.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-[#666666]">🤝 Collaborating Clubs</p>
                  <p className="font-medium">{event.collaborating_clubs.map((c: any) => c.club_name).join(', ')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Registrations */}
          <div className="bg-white rounded-xl overflow-hidden border border-[#E8E8E8] p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Registered Students</h3>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-[#666666]">{registrationCount}/{event.max_participants || '—'}</div>
                  <button
                    onClick={() => exportToCSV(registrations, event.title)}
                    disabled={registrations.length === 0}
                    title={registrations.length === 0 ? 'No data to export' : 'Export CSV'}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded border ${registrations.length === 0 ? 'opacity-50 cursor-not-allowed border-[#8B1E26] text-[#8B1E26]' : 'border-[#8B1E26] text-[#8B1E26] hover:bg-[#fff2f2]'}`}
                  >
                    <Download size={14} />
                    Export CSV
                  </button>
                </div>
              </div>

            {registrations.length === 0 ? (
              <div className="text-center py-8 text-[#666666]">No students have registered for this event yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-[#E8E8E8]">
                      <th className="px-6 py-3 text-left text-sm font-bold text-[#2D2D2D]">Student Name</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-[#2D2D2D]">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-[#2D2D2D]">Registered At</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-[#2D2D2D]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((r) => (
                      <tr key={r.id} className="border-b border-[#E8E8E8]">
                        <td className="px-6 py-3 text-[#2D2D2D] font-medium">{r.studentName}</td>
                        <td className="px-6 py-3 text-[#666666]">{r.email}</td>
                        <td className="px-6 py-3 text-[#666666]">{new Date(r.registeredAt).toLocaleString()}</td>
                        <td className="px-6 py-3">
                          {r.status ? <span className="px-2 py-1 text-sm rounded-full bg-gray-100 text-gray-700">{r.status}</span> : <span className="text-sm text-[#666666]">-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
