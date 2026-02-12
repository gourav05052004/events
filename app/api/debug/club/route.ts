import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Club } from '@/models';

export async function GET() {
  try {
    await connectDB();

    // Get all clubs
    const allClubs = await Club.find({}).lean();

    console.log('=== CLUB DEBUG ===');
    console.log('Total clubs in database:', allClubs.length);
    
    if (allClubs.length > 0) {
      allClubs.forEach((club: any, index: number) => {
        console.log(`\nClub ${index + 1}:`);
        console.log('  _id:', club._id.toString());
        console.log('  email:', club.email);
        console.log('  club_name:', club.club_name);
      });
    }

    return NextResponse.json({
      totalClubs: allClubs.length,
      clubs: allClubs.map((club: any) => ({
        _id: club._id.toString(),
        email: club.email,
        club_name: club.club_name,
      })),
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
