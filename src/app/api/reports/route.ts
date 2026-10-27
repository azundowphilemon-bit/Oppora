import { NextRequest, NextResponse } from 'next/server';
import {
  createSafetyReport,
  getListingById,
  getSafetyReports,
  updateListingRecord,
  updateSafetyReportStatus,
} from '@/lib/repository';
import { REPORT_REASONS, ReportReason, SafetyReport } from '@/lib/types';

export async function GET() {
  const reports = await getSafetyReports();
  return NextResponse.json({ reports });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const listingId = String(body.listingId || '').trim();
    const reason = String(body.reason || '') as ReportReason;
    const details = String(body.details || '').trim();
    const reporterContact = String(body.reporterContact || '').trim();

    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID is required.' }, { status: 400 });
    }
    if (!REPORT_REASONS.includes(reason)) {
      return NextResponse.json(
        { error: 'Please select a valid report reason.' },
        { status: 400 }
      );
    }
    if (details.length < 5 || details.length > 1500) {
      return NextResponse.json(
        { error: 'Please provide brief details (at least 5 characters) to help moderators.' },
        { status: 400 }
      );
    }

    const listing = await getListingById(listingId);

    const newReport: SafetyReport = {
      id: `rep-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      listingId,
      listingTitle: listing?.title || String(body.listingTitle || 'Reported Listing'),
      listingSection: listing?.section || 'opportunities',
      reason,
      details,
      reporterContact: reporterContact || undefined,
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    const created = await createSafetyReport(newReport);
    return NextResponse.json({ report: created }, { status: 201 });
  } catch (error) {
    console.error('POST /api/reports error:', error);
    return NextResponse.json(
      { error: 'Unable to submit report right now.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const reportId = String(body.reportId || '').trim();
    const status = String(body.status || '') as SafetyReport['status'];
    const adminNotes = body.adminNotes ? String(body.adminNotes).trim() : undefined;
    const rejectListingId = body.rejectListingId ? String(body.rejectListingId) : undefined;

    if (!reportId || !['open', 'resolved', 'dismissed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid report update parameters.' }, { status: 400 });
    }

    const updated = await updateSafetyReportStatus(reportId, status, adminNotes);
    if (!updated) {
      return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
    }

    if (rejectListingId) {
      await updateListingRecord(rejectListingId, { status: 'rejected', isFeatured: false });
    }

    return NextResponse.json({ report: updated });
  } catch (error) {
    console.error('PATCH /api/reports error:', error);
    return NextResponse.json({ error: 'Failed to update report.' }, { status: 500 });
  }
}
