import mongoose, { Schema, Document } from 'mongoose';
import { Services } from '../interfaces';

export interface ServiceModel extends Services, Document {}

const ServiceSchema: Schema = new Schema(
  {
    client_id: { type: Number, required: false, default: 0 },
    service_id: { type: Number, required: true },
    domain: { type: String, required: true },
    firstpayment: { type: Number, required: false },
    total: { type: Number, required: true },
    status: { type: String, required: true },
    billingcycle: { type: String, required: true },
    next_due: { type: String, required: true },
    next_invoice: { type: String, required: false },
    expires: { type: String, required: false, default: '' },
    label: { type: String, required: false, default: '' },
    username: { type: String, required: false },
    password: { type: String, required: false },
    name: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: 'Services',
  }
);

ServiceSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.password;
  },
});

export default mongoose.model<ServiceModel>('Service', ServiceSchema);
