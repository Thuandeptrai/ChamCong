import mongoose, { Schema, Document } from 'mongoose';
import { InvoiceType } from '../interfaces';

export interface InvoiceModel extends InvoiceType, Document {}

const InvoiceSchema: Schema = new Schema(
  {
    client_id: { type: Number, required: false, default: 0 },
    object_id: { type: Number, required: true },
    date: { type: String, required: true },
    status: { type: String, required: true },
    duedate: { type: String, required: true },
    paybefore: { type: String, required: true },
    datepaid: { type: String, required: true },
    subtotal: { type: Number, required: false, default: 0 },
    credit: { type: Number, required: false, default: 0 },
    total: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: false, default: 0 },
    taxrate: { type: Number, required: false, default: 0 },
    tax2: { type: Number, required: false, default: 0 },
    taxrate2: { type: Number, required: false, default: 0 },
    taxexempt: { type: Number, required: false, default: 0 },
    rate: { type: Number, required: false, default: 0 },
    rate2: { type: Number, required: false, default: 0 },
    rate3: { type: Number, required: false, default: 0 },
    notes: { type: String, required: false, default: '' },
    items: { type: Array, required: false, default: [] },
    number: { type: String, required: true },
    currency: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: 'invoices',
  }
);

InvoiceSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.password;
  },
});

export default mongoose.model<InvoiceModel>('invoice', InvoiceSchema);
