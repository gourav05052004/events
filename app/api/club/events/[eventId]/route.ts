import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { Event, EventRegistration } from '@/models';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    await connectDB();

    const { eventId } = await params;
    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
    }

    // Authenticate club using cookie set on login
    const clubToken = request.cookies.get('club_token')?.value || '';
    if (!clubToken || !mongoose.Types.ObjectId.isValid(clubToken)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clubObjectId = new mongoose.Types.ObjectId(clubToken);

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Ensure the event belongs to this club
    if (!event.primary_club_id || event.primary_club_id.toString() !== clubObjectId.toString()) {
      return NextResponse.json({ error: 'Not authorized to delete this event' }, { status: 403 });
    }

    // Do not allow deletion of approved events
    if (event.status === 'APPROVED' || event.status === 'approved') {
      return NextResponse.json({ error: 'Approved events cannot be deleted' }, { status: 403 });
    }

    // Remove related registrations
    await EventRegistration.deleteMany({ event_id: event._id });

    // Delete the event
    await Event.deleteOne({ _id: event._id });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/club/events/[eventId]] Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    await connectDB();

    const { eventId } = await params;
    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
    }

    // Authenticate club using cookie set on login
    const clubToken = request.cookies.get('club_token')?.value || '';
    if (!clubToken || !mongoose.Types.ObjectId.isValid(clubToken)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clubObjectId = new mongoose.Types.ObjectId(clubToken);

    const event = await Event.findOne({ _id: eventId, primary_club_id: clubObjectId })
      .populate('allocated_resource_id', 'name')
      .lean();

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const registrationCount = await EventRegistration.countDocuments({ event_id: new mongoose.Types.ObjectId(eventId) });

    return NextResponse.json({ event, registrationCount }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/club/events/[eventId]] Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    await connectDB();

    const { eventId } = await params;
    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
    }

    // Authenticate club using cookie set on login
    const clubToken = request.cookies.get('club_token')?.value || '';
    if (!clubToken || !mongoose.Types.ObjectId.isValid(clubToken)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clubObjectId = new mongoose.Types.ObjectId(clubToken);

    const event = await Event.findOne({ _id: eventId, primary_club_id: clubObjectId });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Only allow editing if event is pending
    if (event.status !== 'PENDING' && event.status !== 'pending') {
      return NextResponse.json({ error: 'Only pending events can be edited' }, { status: 403 });
    }

    const contentType = request.headers.get('content-type') || '';
    let bodyJson: any = {};
    let posterUrl: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      // fields similar to create route
      bodyJson.title = String(formData.get('title') || event.title || '').trim();
      bodyJson.description = String(formData.get('description') || event.description || '').trim();
      bodyJson.eventType = String(formData.get('eventType') || event.event_type || '').trim();
      bodyJson.date = String(formData.get('date') || event.date?.toISOString() || '').trim();
      bodyJson.endDate = String(formData.get('endDate') || event.end_date?.toISOString() || '').trim();
      bodyJson.startTime = String(formData.get('startTime') || event.start_time || '').trim();
      bodyJson.endTime = String(formData.get('endTime') || event.end_time || '').trim();
      bodyJson.registrationDeadline = String(formData.get('registrationDeadline') || event.registration_deadline?.toISOString() || '').trim();
      bodyJson.venueType = String(formData.get('venueType') || event.requested_resource_type || '').trim();
      bodyJson.maxParticipants = String(formData.get('maxParticipants') || event.max_participants || '');
      bodyJson.minParticipants = String(formData.get('minParticipants') || event.min_participants || '');
      bodyJson.minTeamMembers = String(formData.get('minTeamMembers') || event.min_team_members || '');
      bodyJson.maxTeamMembers = String(formData.get('maxTeamMembers') || event.max_team_members || '');
      bodyJson.categories = String(formData.get('categories') || JSON.stringify(event.categories || []) || '[]');

      const poster = formData.get('poster') as File | null;
      if (poster) {
        // upload to cloudinary if configured
        try {
          const arrayBuffer = await poster.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const publicId = `event_${eventId}`;
          posterUrl = await uploadToCloudinary(buffer, publicId);
        } catch (e) {
          console.error('Poster upload failed', e);
        }
      }
    } else {
      bodyJson = await request.json().catch(() => ({}));
      posterUrl = bodyJson.poster_url || undefined;
    }

    // Apply updates
    if (bodyJson.title) event.title = bodyJson.title;
    if (bodyJson.description) event.description = bodyJson.description;
    if (bodyJson.eventType) event.event_type = bodyJson.eventType.toUpperCase() === 'TEAM' ? 'TEAM' : 'INDIVIDUAL';
    if (bodyJson.date) event.date = new Date(bodyJson.date);
    if (bodyJson.endDate) event.end_date = new Date(bodyJson.endDate);
    if (bodyJson.startTime) event.start_time = bodyJson.startTime;
    if (bodyJson.endTime) event.end_time = bodyJson.endTime;
    if (bodyJson.registrationDeadline) event.registration_deadline = new Date(bodyJson.registrationDeadline);
    if (bodyJson.venueType) {
      const vt = String(bodyJson.venueType).toUpperCase();
      if (['HALL', 'ROOM', 'LAB'].includes(vt)) event.requested_resource_type = vt as any;
    }
    if (bodyJson.maxParticipants) event.max_participants = Number(bodyJson.maxParticipants);
    if (bodyJson.minParticipants) event.min_participants = Number(bodyJson.minParticipants);
    if (bodyJson.minTeamMembers) event.min_team_members = Number(bodyJson.minTeamMembers);
    if (bodyJson.maxTeamMembers) event.max_team_members = Number(bodyJson.maxTeamMembers);
    if (bodyJson.categories) {
      try {
        event.categories = JSON.parse(bodyJson.categories);
      } catch {
        event.categories = Array.isArray(bodyJson.categories) ? bodyJson.categories : [];
      }
    }
    if (posterUrl) event.poster_url = posterUrl;

    await event.save();

    return NextResponse.json({ success: true, event }, { status: 200 });
  } catch (error) {
    console.error('[PATCH /api/club/events/[eventId]] Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
