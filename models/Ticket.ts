import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITicket extends Document {
    customerId: mongoose.Types.ObjectId;
    loanAmount: number;
    status: 'OPEN' | 'ONGOING' | 'CLOSED';
    priority: 'URGENT' | 'NORMAL';
    assignedAgentId?: mongoose.Types.ObjectId;
    lastMessagePreview?: string;
    lastMessageAt?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const TicketSchema: Schema = new Schema(
    {
        customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
        loanAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: ['OPEN', 'ONGOING', 'CLOSED'],
            default: 'OPEN',
        },
        priority: {
            type: String,
            enum: ['URGENT', 'NORMAL'],
            default: 'NORMAL',
        },
        assignedAgentId: { type: Schema.Types.ObjectId, ref: 'Agent' },
        lastMessagePreview: { type: String },
        lastMessageAt: { type: Date },
        notes: { type: String },
    },
    { timestamps: true }
);

const Ticket: Model<ITicket> =
    mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);

export default Ticket;
