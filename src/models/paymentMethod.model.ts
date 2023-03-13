import mongoose, { Schema, Document } from 'mongoose';
import { PaymentMethodType } from '../interfaces';

export interface PaymentMethodModel extends PaymentMethodType, Document {}

const PaymentMethodSchema: Schema = new Schema(
  {
    object_id: { type: Number, required: true },
    name: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: 'paymentMethods',
  }
);

PaymentMethodSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

export default mongoose.model<PaymentMethodModel>(
  'paymentMethod',
  PaymentMethodSchema
);
