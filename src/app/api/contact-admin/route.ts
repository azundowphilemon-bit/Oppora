import { NextRequest, NextResponse } from 'next/server';
import {
  createAdminMessage,
  getAdminMessages,
  markAdminMessageReviewed,
} from '@/lib/repository';

export async function GET() {
  const messages = await getAdminMessages();
  return NextResponse.json({ messages });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const senderName = String(body.senderName || '').trim();
    const senderContact = String(body.senderContact || '').trim();
    const subject = String(body.subject || '').trim();
    const message = String(body.message || '').trim();

    if (senderName.length < 2) {
      return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
    }
    if (senderContact.length < 5) {
      return NextResponse.json(
        { error: 'Please provide a phone number or email so administrators can respond.' },
        { status: 400 }
      );
    }
    if (subject.length < 3) {
      return NextResponse.json({ error: 'Please enter a subject.' }, { status: 400 });
    }
    if (message.length < 10 || message.length > 2500) {
      return NextResponse.json(
        { error: 'Message must be between 10 and 2,500 characters.' },
        { status: 400 }
      );
    }

    const created = await createAdminMessage({
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      senderName,
      senderContact,
      subject,
      message,
      status: 'unread',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: created }, { status: 201 });
  } catch (error) {
    console.error('POST /api/contact-admin error:', error);
    return NextResponse.json(
      { error: 'Unable to send message at this time.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as { id?: string };
    if (!body.id) {
      return NextResponse.json({ error: 'Message ID is required.' }, { status: 400 });
    }
    const updated = await markAdminMessageReviewed(body.id);
    if (!updated) {
      return NextResponse.json({ error: 'Message not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: updated });
  } catch (error) {
    console.error('PATCH /api/contact-admin error:', error);
    return NextResponse.json({ error: 'Failed to update message.' }, { status: 500 });
  }
}
