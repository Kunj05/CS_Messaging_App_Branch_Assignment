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
        let agent = null;
        if (agentName) {
            agent = await Agent.findOne({ name: agentName });
        }

        let query: any = {};

        // -------------------
        // 1. Tab-specific query
        // -------------------
        if (status === 'OPEN') {
            query.status = 'OPEN';
        } else if (status === 'ONGOING') {
            if (!agent) return NextResponse.json([]); // No agent → no ongoing tickets
            query.status = 'ONGOING';
            query.assignedAgentId = agent._id;
        } else if (status === 'CLOSED') {
            if (!agent) return NextResponse.json([]); // No agent → no closed tickets
            query.status = 'CLOSED';
            query.assignedAgentId = agent._id;
        } else if (status === 'ALL') {
            if (!agent) {
                query.status = { $in: ['OPEN', 'ONGOING'] };
            } else {
                query.$or = [
                    { status: 'OPEN' },
                    { status: 'ONGOING', assignedAgentId: agent._id },
                    { status: 'CLOSED', assignedAgentId: agent._id }
                ];
            }
        }

        // -------------------
        // 2. Search filter
        // -------------------
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

            if (query.$or) {
                query.$and = [{ $or: query.$or }, searchCondition];
                delete query.$or;
            } else {
                Object.assign(query, searchCondition);
            }
        }

        // -------------------
        // 3. Random sampling for OPEN tickets
        // -------------------
        if (status === 'OPEN' && !search) {
            const tickets = await Ticket.aggregate([
                { $match: { status: 'OPEN' } },
                { $sample: { size: 5 } }, // Random 5 tickets
                {
                    $lookup: {
                        from: 'customers',
                        localField: 'customerId',
                        foreignField: '_id',
                        as: 'customerId',
                    },
                },
                { $unwind: { path: '$customerId', preserveNullAndEmptyArrays: true } },
                { $sort: { priority: -1, lastMessageAt: -1 } },
            ]);
            return NextResponse.json(tickets);
        }

        // -------------------
        // 4. Regular find for ongoing/closed/all
        // -------------------
        const tickets = await Ticket.find(query)
            .populate('customerId', 'name phone')
            .sort({ priority: -1, lastMessageAt: -1 })
            .limit(limit);

        return NextResponse.json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
    }
}
