import mongoose, { Schema, Document } from 'mongoose';
import { OrderPageType } from '../interfaces';

export interface OrderPageModel extends OrderPageType, Document {}

const OrderPageSchema: Schema = new Schema(
  {
    object_id: { type: Number, required: true },
    parent_id: { type: Number, required: false, default: 0 },
    contains: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: false, default: '' },
    slug: { type: String, required: true },
    visible: { type: Number, required: false, default: 0 },
    sort_order: { type: Number, required: true },
    ctype: { type: String, required: false, default: '' },
    ptype: { type: String, required: false, default: '' },
    ltype: { type: String, required: false, default: '' },
    otype: { type: String, required: false, default: '' },
    products: { type: Number, required: false, default: 0 },
    subcategories: { type: Number, required: false, default: 0 },
    ptype_id: { type: Number, required: false, default: 0 },
  },
  {
    timestamps: true,
    collection: 'orderPages',
  }
);

OrderPageSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

export default mongoose.model<OrderPageModel>('orderPage', OrderPageSchema);
