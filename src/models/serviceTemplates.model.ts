import mongoose, { Schema, Document } from 'mongoose';
import { ServiceTemplateType } from '../interfaces';

const { ObjectId } = Schema.Types;

export interface ServiceTemplateModel extends ServiceTemplateType, Document {}

const ServiceTemplatesSchema: Schema = new Schema(
  {
    service_id: {type: String},
    name: {type: String},
    price: {type: String},
    type: {type: String},
    group: {type: String},
  },
  {
    timestamps: true,
    collection: 'ServiceTemplates',
  }
);

ServiceTemplatesSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.password;
  },
});

export default mongoose.model<ServiceTemplateModel>('ServiceTemplate', ServiceTemplatesSchema);