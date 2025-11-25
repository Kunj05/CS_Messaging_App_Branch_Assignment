import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CannedResponse from '@/models/CannedResponse';

export async function GET() {
    await dbConnect();

    const cannedResponses = [
        {
            title: 'Greeting',
            body: 'Hello! How can I assist you today?',
        },
        {
            title: 'Loan Status',
            body: 'Your loan application is currently under review. We will update you shortly.',
        },
        {
            title: 'Disbursement',
            body: 'The loan amount has been disbursed to your registered bank account.',
        },
        {
            title: 'Repayment',
            body: 'You can repay your loan via the app or through bank transfer.',
        },
        {
            title: 'Closing Ticket',
            body: 'I am closing this ticket now as the issue seems resolved. Feel free to open a new one if you need further assistance.',
        },
    ];

    try {
        await CannedResponse.deleteMany({}); // Clear existing
        await CannedResponse.insertMany(cannedResponses);
        return NextResponse.json({ message: 'Canned responses seeded successfully' });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to seed canned responses' },
            { status: 500 }
        );
    }
}
