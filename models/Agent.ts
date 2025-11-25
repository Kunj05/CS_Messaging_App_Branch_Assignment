import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAgent extends Document {
    name: string;
    createdAt: Date;
}

const AgentSchema: Schema = new Schema({
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Agent: Model<IAgent> =
    mongoose.models.Agent || mongoose.model<IAgent>('Agent', AgentSchema);

export default Agent;
