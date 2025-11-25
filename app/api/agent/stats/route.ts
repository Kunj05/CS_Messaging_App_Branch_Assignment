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
        // Find agent
        const agent = await Agent.findOne({ name: agentName });
        if (!agent) {
            console.log(`Agent not found: ${agentName}`);
            return NextResponse.json({ completedCount: 0 });
        }

        // Find all tickets assigned to this agent
        const tickets = await Ticket.find({ assignedAgentId: agent._id }).populate('customerId', 'name phone');

        // console.log("*******************");
        // console.log(`Tickets for agent "${agentName}" (id: ${agent._id}):`);
        // console.log(JSON.stringify(tickets, null, 2));
        // console.log("*******************");

        const completedCount = tickets.filter(t => t.status === 'CLOSED').length;

        return NextResponse.json({ completedCount });
    } catch (error) {
        console.error('Error fetching agent stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch agent stats' },
            { status: 500 }
        );
    }
}
