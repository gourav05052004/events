import cloudinary from '@/lib/cloudinary';
import { createEventWithSlots } from '@/lib/db-helpers';
import { EventType } from '@/models';
import { ObjectId } from 'mongodb';

const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'club-events';

const uploadPoster = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUDINARY_FOLDER,
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Cloudinary upload failed'));
          return;
        }
        resolve({ secure_url: result.secure_url });
      }
    );

    stream.end(buffer);
  });
};

const normalizeResourceType = (value: string) => {
  const upper = value.toUpperCase();
  if (upper === 'HALL' || upper === 'ROOM' || upper === 'LAB') {
    return upper as 'HALL' | 'ROOM' | 'LAB';
  }
  return null;
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const poster = formData.get('poster') as File | null;

    const headerClubId = request.headers.get('x-club-id') || '';
    const primaryClubId = String(formData.get('primaryClubId') || headerClubId || '').trim();
    const title = String(formData.get('title') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const eventType = String(formData.get('eventType') || '').trim();
    const date = String(formData.get('date') || '').trim();
    const endDate = String(formData.get('endDate') || '').trim();
    const startTime = String(formData.get('startTime') || '').trim();
    const endTime = String(formData.get('endTime') || '').trim();
    const registrationDeadline = String(formData.get('registrationDeadline') || '').trim();
    const categoriesRaw = String(formData.get('categories') || '').trim();
    const venueType = String(formData.get('venueType') || '').trim();
    const minParticipants = Number(formData.get('minParticipants') || 1);
    const maxParticipants = Number(formData.get('maxParticipants') || 0);
    const minTeamMembers = Number(formData.get('minTeamMembers') || 0);
    const maxTeamMembers = Number(formData.get('maxTeamMembers') || 0);

    console.log('[POST /api/club/events] Creating event for clubId:', primaryClubId);

    if (!primaryClubId || !title || !description || !eventType || !date || !endDate || !startTime || !endTime) {
      console.error('[POST /api/club/events] Missing required fields');
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!ObjectId.isValid(primaryClubId)) {
      console.error('[POST /api/club/events] Invalid club ID:', primaryClubId);
      return Response.json({ error: 'Invalid club ID' }, { status: 400 });
    }

    if (!registrationDeadline || !venueType || !minParticipants || !maxParticipants) {
      console.error('[POST /api/club/events] Missing additional fields');
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (eventType.toUpperCase() === 'TEAM') {
      if (!minTeamMembers || !maxTeamMembers) {
        console.error('[POST /api/club/events] Missing team size limits');
        return Response.json({ error: 'Missing team size limits' }, { status: 400 });
      }
    }

    if (!poster) {
      console.error('[POST /api/club/events] Missing poster image');
      return Response.json({ error: 'Poster image is required' }, { status: 400 });
    }

    const resourceType = normalizeResourceType(venueType);
    if (!resourceType) {
      console.error('[POST /api/club/events] Invalid venue type:', venueType);
      return Response.json({ error: 'Invalid venue type' }, { status: 400 });
    }

    console.log('[POST /api/club/events] Uploading poster to Cloudinary...');
    const uploadResult = await uploadPoster(poster);
    console.log('[POST /api/club/events] Poster uploaded:', uploadResult.secure_url);

    const eventData = {
      primary_club_id: new ObjectId(primaryClubId),
      title,
      description,
      event_type: (eventType.toUpperCase() === 'TEAM' ? 'TEAM' : 'INDIVIDUAL') as EventType,
      poster_url: uploadResult.secure_url,
      location: '', // Location will be set when admin allocates a venue
      requested_resource_type: resourceType,
      allocated_resource_id: null,
      date: new Date(date),
      end_date: new Date(endDate),
      start_time: startTime,
      end_time: endTime,
      min_participants: minParticipants,
      max_participants: maxParticipants,
      min_team_members: eventType.toUpperCase() === 'TEAM' ? minTeamMembers : undefined,
      max_team_members: eventType.toUpperCase() === 'TEAM' ? maxTeamMembers : undefined,
      categories: categoriesRaw ? JSON.parse(categoriesRaw) : [],
      registration_deadline: new Date(registrationDeadline),
      status: 'PENDING' as const,
    };

    console.log('[POST /api/club/events] Creating event with data:', JSON.stringify(eventData, null, 2));

    const event = await createEventWithSlots(eventData);

    if (!event) {
      console.error('[POST /api/club/events] Failed to create event in database');
      return Response.json({ error: 'Failed to create event' }, { status: 500 });
    }

    console.log('[POST /api/club/events] Event created successfully with ID:', event._id);

    return Response.json({
      message: 'Event created successfully',
      eventId: event._id,
      posterUrl: uploadResult.secure_url,
    });
  } catch (error) {
    console.error('[POST /api/club/events] Error:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
