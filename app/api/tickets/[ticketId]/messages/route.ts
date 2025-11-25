import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';
import Message from '@/models/Message';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ ticketId: string }> }
) {
    await dbConnect();
    const { ticketId } = await params;

    try {
        const body = await request.json();
        const { senderType, senderName, text } = body;
        console.log('POST /messages', { ticketId, senderType, senderName, text });

        if (!senderType || !senderName || !text) {
            return NextResponse.json(
                { error: 'Sender type, name, and text are required' },
                { status: 400 }
            );
        }

        // Check if ticket is closed
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }
        if (ticket.status === 'CLOSED') {
            return NextResponse.json(
                { error: 'Cannot send message to a closed ticket' },
                { status: 400 }
            );
        }

        // 1. Create Message
        const message = await Message.create({
            ticketId,
            senderType,
            senderName,
            text,
        });

        // 2. Update Ticket
        await Ticket.findByIdAndUpdate(ticketId, {
            lastMessagePreview: text,
            lastMessageAt: new Date(),
        });

        return NextResponse.json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}
