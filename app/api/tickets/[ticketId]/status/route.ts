import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ ticketId: string }> }
) {
    await dbConnect();
    const { ticketId } = await params;

    try {
        const body = await request.json();
        const { status } = body;

        if (!status || !['OPEN', 'ONGOING', 'CLOSED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const ticket = await Ticket.findByIdAndUpdate(
            ticketId,
            { status },
            { new: true }
        );

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        return NextResponse.json(ticket);
    } catch (error) {
        console.error('Error updating ticket status:', error);
        return NextResponse.json(
            { error: 'Failed to update ticket status' },
            { status: 500 }
        );
    }
}
