import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';
import Agent from '@/models/Agent';

export async function POST(
    request: Request,
    { params }: { params: { ticketId: string } }
) {
    await dbConnect();
    const { ticketId } = await params;

    try {
        const body = await request.json();
        const { agentName } = body;

        if (!agentName) {
            return NextResponse.json(
                { error: 'Agent name is required' },
                { status: 400 }
            );
        }

        // 1. Find or Create Agent
        let agent = await Agent.findOne({ name: agentName });
        if (!agent) {
            agent = await Agent.create({ name: agentName });
        }

        // 2. Update Ticket (Atomic Check)
        // Only assign if status is OPEN
        const ticket = await Ticket.findOneAndUpdate(
            { _id: ticketId, status: 'OPEN' },
            {
                assignedAgentId: agent._id,
                status: 'ONGOING',
            },
            { new: true }
        );

        if (!ticket) {
            // Check if ticket exists but is not OPEN
            const existing = await Ticket.findById(ticketId);
            if (!existing) {
                return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
            } else {
                return NextResponse.json(
                    { error: 'Ticket already assigned or closed' },
                    { status: 409 }
                );
            }
        }

        return NextResponse.json(ticket);
    } catch (error) {
        console.error('Error assigning ticket:', error);
        return NextResponse.json(
            { error: 'Failed to assign ticket' },
            { status: 500 }
        );
    }
}
