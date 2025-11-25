import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICannedResponse extends Document {
    title: string;
    body: string;
    createdAt: Date;
}

const CannedResponseSchema: Schema = new Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const CannedResponse: Model<ICannedResponse> =
    mongoose.models.CannedResponse ||
    mongoose.model<ICannedResponse>('CannedResponse', CannedResponseSchema);

export default CannedResponse;
