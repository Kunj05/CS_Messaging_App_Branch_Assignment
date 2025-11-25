import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';
import Message from '@/models/Message';
import Customer from '@/models/Customer';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ ticketId: string }> }
) {
    await dbConnect();
    const { ticketId } = await params;

    try {
        const ticket = await Ticket.findById(ticketId).populate('customerId');
        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        const messages = await Message.find({ ticketId }).sort({ createdAt: 1 });

        return NextResponse.json({
            ticket,
            messages,
        });
    } catch (error) {
        console.error('Error fetching ticket:', error);
        return NextResponse.json(
            { error: 'Failed to fetch ticket' },
            { status: 500 }
        );
    }
}
