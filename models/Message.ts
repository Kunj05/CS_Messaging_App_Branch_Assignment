import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
    ticketId: mongoose.Types.ObjectId;
    senderType: 'CUSTOMER' | 'AGENT' | 'SYSTEM';
    senderName: string;
    text: string;
    createdAt: Date;
}

const MessageSchema: Schema = new Schema({
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true },
    senderType: {
        type: String,
        enum: ['CUSTOMER', 'AGENT', 'SYSTEM'],
        required: true,
    },
    senderName: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Message: Model<IMessage> =
    mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
