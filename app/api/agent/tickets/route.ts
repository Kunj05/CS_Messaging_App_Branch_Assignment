import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';
import Customer from '@/models/Customer';
import Agent from '@/models/Agent';

export async function GET(request: Request) {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'OPEN';
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const agentName = searchParams.get('agentName');

    try {
        const query: any = {};

        // 1. Status Filter & Visibility Rules
        if (status !== 'ALL') {
            // Specific Tab Selected
            query.status = status;

            // Strict visibility for CLOSED tab
            if (status === 'CLOSED') {
                if (!agentName) return NextResponse.json([]);
                const agent = await Agent.findOne({ name: agentName });
                if (!agent) return NextResponse.json([]);
                query.assignedAgentId = agent._id;
            }
        } else {
            // Global Search (status = ALL)
            // Show: OPEN tickets OR ONGOING tickets OR (CLOSED tickets assigned to me)

            if (!agentName) {
                // If no agent name, show OPEN and ONGOING
                query.status = { $in: ['OPEN', 'ONGOING'] };
            } else {
                const agent = await Agent.findOne({ name: agentName });
                if (!agent) {
                    query.status = { $in: ['OPEN', 'ONGOING'] };
                } else {
                    query.$or = [
                        { status: 'OPEN' },
                        { status: 'ONGOING' },
                        { status: 'CLOSED', assignedAgentId: agent._id }
                    ];
                }
            }
        }

        // 2. Search Filter
        if (search) {
            const customers = await Customer.find({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } },
                ],
            }).select('_id');

            const customerIds = customers.map(c => c._id);

            const searchCondition = {
                $or: [
                    { customerId: { $in: customerIds } },
                    { lastMessagePreview: { $regex: search, $options: 'i' } },
                ],
            };

            // Combine with existing query
            if (query.$or) {
                // If we already have an $or from visibility rules, we need to AND it with search
                query.$and = [
                    { $or: query.$or },
                    searchCondition
                ];
                delete query.$or; // Remove the top-level $or as it's now inside $and
            } else {
                // Just add to query
                Object.assign(query, searchCondition);
            }
        }

        // 3. Random Sampling for OPEN tickets (Concurrency)
        // If status is OPEN and NOT searching, return 5 random tickets
        if (status === 'OPEN' && !search) {
            const tickets = await Ticket.aggregate([
                { $match: { status: 'OPEN' } },
                { $sample: { size: 5 } },
                {
                    $lookup: {
                        from: 'customers',
                        localField: 'customerId',
                        foreignField: '_id',
                        as: 'customerId',
                    },
                },
                {
                    $unwind: {
                        path: '$customerId',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $sort: { priority: -1, lastMessageAt: -1 }, // Optional: sort the random batch?
                },
            ]);
            return NextResponse.json(tickets);
        }

        const tickets = await Ticket.find(query)
            .populate('customerId', 'name phone')
            .sort({ priority: -1, lastMessageAt: -1 })
            .limit(limit);

        return NextResponse.json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tickets' },
            { status: 500 }
        );
    }
}
