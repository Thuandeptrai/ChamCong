import { ObjectId } from 'mongodb';
import mongoose, { Schema, Document } from 'mongoose';
import { SupportType } from '../interfaces';

export interface RoleModel extends SupportType, Document {}

const SupportSchema: Schema = new Schema(
  {
    client_read: { type: Number },
    ticket_number: { type: Number },
    date: { type: String },
    deptname: { type: String },
    subject: { type: String },
    status: { type: String },
    body: { type: String },
    dept_id: { type: Schema.Types.ObjectId, ref : 'Department', required: true },
    attachments: { type: Array },
    email: { type: String },
    file: { type: String },
    level: {type: Number},
    userId: {type: ObjectId},
    feedBack: {type: String},
    modifiedUser: {type: ObjectId}
  },

  {
    timestamps: true,
    collection: 'supports',
  }
);

// SupportSchema.set('toJSON', {
//   virtuals: true,
//   versionKey: false,
//   transform: function (doc, ret) {
//     delete ret._id;
//   },
// });

export default mongoose.model<RoleModel>('support', SupportSchema);
