import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CannedResponse from '@/models/CannedResponse';

export async function GET() {
    await dbConnect();

    try {
        const responses = await CannedResponse.find({}).sort({ title: 1 });
        return NextResponse.json(responses);
    } catch (error) {
        console.error('Error fetching canned responses:', error);
        return NextResponse.json(
            { error: 'Failed to fetch canned responses' },
            { status: 500 }
        );
    }
}
