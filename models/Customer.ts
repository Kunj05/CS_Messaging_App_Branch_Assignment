import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICustomer extends Document {
    name: string;
    phone: string;
    createdAt: Date;
}

const CustomerSchema: Schema = new Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Customer: Model<ICustomer> =
    mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);

export default Customer;
