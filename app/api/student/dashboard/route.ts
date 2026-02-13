import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import connectDB from '@/lib/db';
import EventRegistration from '@/models/EventRegistration';
import Event from '@/models/Event';
import Student from '@/models/Student';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const payload = requireAuth(request);
    if (payload instanceof NextResponse) {
      return payload;
    }

    const studentId = payload.id;
    await connectDB();

    const { ObjectId } = mongoose.Types;
    const objectStudentId = new ObjectId(studentId);

    // Fetch student details
    const student = await Student.findById(objectStudentId).select('name email');
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get total registered events count
    const totalRegisteredEvents = await EventRegistration.countDocuments({
      $or: [
        { student_id: objectStudentId },
        { student_id: studentId },
      ]
    });

    // Get registered events with event details
    const registeredEvents = await EventRegistration.find({
      $or: [
        { student_id: objectStudentId },
        { student_id: studentId },
      ]
    })
      .populate('event_id')
      .sort({ registered_at: -1 });

    // Separate upcoming and completed events
    const now = new Date();
    const upcomingRegistrations = [];
    const completedRegistrations = [];

    for (const reg of registeredEvents) {
      const event = reg.event_id as any;
      if (event && event.date) {
        const eventDate = new Date(event.date);
        if (eventDate >= now) {
          upcomingRegistrations.push(reg);
        } else {
          completedRegistrations.push(reg);
        }
      }
    }

    // Get recommended events (approved events not registered by student)
    const registeredEventIds = registeredEvents
      .map((reg: any) => reg.event_id?._id)
      .filter(Boolean);

    const recommendedEvents = await Event.find({
      _id: { $nin: registeredEventIds },
      status: 'APPROVED',
      date: { $gte: now },
      registration_deadline: { $gte: now }
    })
      .sort({ date: 1 })
      .limit(4)
      .populate('primary_club_id', 'name');

    // Format registered events
    const formatEvent = (reg: any) => {
      const event = reg.event_id;
      if (!event) return null;

      // Map registration status to event card status
      let cardStatus: 'approved' | 'pending' | 'cancelled' = 'approved';
      if (reg.status === 'WAITLISTED') {
        cardStatus = 'pending';
      } else if (reg.status === 'CONFIRMED') {
        cardStatus = 'approved';
      }

      return {
        id: event._id.toString(),
        title: event.title,
        date: event.date,
        time: event.start_time,
        location: event.location || 'TBD',
        image: event.poster_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop',
        status: cardStatus,
        registeredAt: reg.registered_at,
      };
    };

    const myRegisteredEvents = upcomingRegistrations
      .map(formatEvent)
      .filter(Boolean)
      .slice(0, 4);

    const upcomingEventsData = recommendedEvents.map((event: any) => ({
      id: event._id.toString(),
      title: event.title,
      date: event.date,
      time: event.start_time,
      location: event.location || 'TBD',
      image: event.poster_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop',
      status: 'approved',
      club: event.primary_club_id?.name,
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          student: {
            name: student.name,
            email: student.email,
          },
          statistics: {
            totalRegistered: totalRegisteredEvents,
            totalCompleted: completedRegistrations.length,
            totalUpcoming: upcomingRegistrations.length,
            newNotifications: 0, // You can implement notifications later
          },
          myRegisteredEvents,
          upcomingEvents: upcomingEventsData,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Student dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
