// /api/agent/ongoing-count.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';
import Agent from '@/models/Agent';

export async function GET(request: Request) {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const agentName = searchParams.get('agentName');

    if (!agentName) {
        return NextResponse.json({ error: 'Agent name is required' }, { status: 400 });
    }

    try {
        const agent = await Agent.findOne({ name: agentName });
        if (!agent) {
            return NextResponse.json({ ongoingCount: 0 });
        }

        const ongoingCount = await Ticket.countDocuments({
            assignedAgentId: agent._id,
            status: 'ONGOING',
        });

        return NextResponse.json({ ongoingCount });
    } catch (error) {
        console.error('Error fetching agent ongoing count:', error);
        return NextResponse.json(
            { error: 'Failed to fetch ongoing count' },
            { status: 500 }
        );
    }
}
