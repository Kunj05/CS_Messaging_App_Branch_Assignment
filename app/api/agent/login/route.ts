import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Agent from '@/models/Agent';

export async function POST(request: Request) {
    await dbConnect();

    try {
        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json(
                { error: 'Agent name is required' },
                { status: 400 }
            );
        }

        // Find or Create Agent
        let agent = await Agent.findOne({ name });
        if (!agent) {
            agent = await Agent.create({ name });
        }

        return NextResponse.json(agent);
    } catch (error) {
        console.error('Error logging in agent:', error);
        return NextResponse.json(
            { error: 'Failed to login agent' },
            { status: 500 }
        );
    }
}
