import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import Ticket from '@/models/Ticket';
import Message from '@/models/Message';

export async function POST(request: Request) {
    await dbConnect();

    try {
        const body = await request.json();
        const { name, phone, message } = body;

        if (!name || !phone || !message) {
            return NextResponse.json(
                { error: 'Name, phone, and message are required' },
                { status: 400 }
            );
        }

        // 1. Find or Create Customer
        let customer = await Customer.findOne({ phone });
        if (!customer) {
            customer = await Customer.create({ name, phone });
        }

        // 2. Determine Priority (Simple Keyword Logic)
        const urgentKeywords = [
            'loan',
            'disbursement',
            'approve',
            'money',
            'urgent',
            'emergency',
        ];
        const isUrgent = urgentKeywords.some((keyword) =>
            message.toLowerCase().includes(keyword)
        );
        const priority = isUrgent ? 'URGENT' : 'NORMAL';

        // 3. Generate Random Loan Amount (4-5 digits: 1000 - 99999)
        const loanAmount = Math.floor(Math.random() * 99000) + 1000;

        // 4. Create Ticket
        const ticket = await Ticket.create({
            customerId: customer._id,
            loanAmount,
            status: 'OPEN',
            priority,
            lastMessagePreview: message,
            lastMessageAt: new Date(),
        });

        // 5. Create Initial Message
        await Message.create({
            ticketId: ticket._id,
            senderType: 'CUSTOMER',
            senderName: name,
            text: message,
        });

        return NextResponse.json({
            ticketId: ticket._id,
            customerId: customer._id,
            priority,
        });
    } catch (error) {
        console.error('Error creating ticket:', error);
        return NextResponse.json(
            { error: 'Failed to create ticket' },
            { status: 500 }
        );
    }
}
