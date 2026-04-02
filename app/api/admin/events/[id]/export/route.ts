import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Event, EventRegistration } from '@/models';
import { Types } from 'mongoose';
import ExcelJS from 'exceljs';

/**
 * GET /api/admin/events/[id]/export
 * Export event registrations as an Excel (.xlsx) file
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const event = await Event.findById(id).lean() as any;

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    const registrations = await EventRegistration.find({ event_id: id })
      .populate('student_id', 'name email roll_number department batch')
      .sort({ registered_at: -1 })
      .lean();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Events Admin';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Registrations');

    sheet.columns = [
      { header: 'Name', key: 'name', width: 28 },
      { header: 'Roll Number', key: 'roll_number', width: 18 },
      { header: 'Email', key: 'email', width: 32 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Batch', key: 'batch', width: 12 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Registered On', key: 'registered_at', width: 18 },
    ];

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF8B1E26' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    registrations.forEach((r: any) => {
      const student = r.student_id as any;
      sheet.addRow({
        name: student?.name || 'Unknown',
        roll_number: student?.roll_number || '',
        email: student?.email || '',
        department: student?.department || '',
        batch: student?.batch || '',
        status: r.status,
        registered_at: r.registered_at
          ? new Date(r.registered_at).toLocaleDateString('en-GB')
          : '',
      });
    });

    // Auto-fit height for all rows
    sheet.eachRow((row) => {
      row.height = 18;
    });

    const buffer = await workbook.xlsx.writeBuffer();

    const safeName = (event.title as string)
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();

    return new NextResponse(buffer as ArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${safeName}_registrations.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Error exporting registrations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export registrations' },
      { status: 500 }
    );
  }
}
