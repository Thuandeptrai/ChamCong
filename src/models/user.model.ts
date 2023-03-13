import mongoose, { Schema, Document } from 'mongoose';
import { UserType } from '../interfaces';

const { ObjectId } = Schema.Types;

export interface UserModel extends UserType, Document {}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    lastLogin: { type: String, required: false },
    status: { type: String },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    companyName: { type: String, required: false, default: '' },
    address1: { type: String, required: false, default: '' },
    address2: { type: String, required: false, default: '' },

    country: { type: String, required: true },
    phonenumber: { type: String, required: false, default: '' },
    notes: { type: String, required: false, default: '0' },
    company: { type: Number, required: false, default: 0, min: 0 },
    credit: { type: Number, required: true },
    taxexempt: { type: String, required: false, default: '0' },
    latefeeoveride: { type: Number, required: false, default: 0, min: 0 },
    overideautosusp: { type: String, required: false, default: '0' },
    taxrateoverride: { type: String, required: false, default: '0' },
    taxrate: { type: String, required: false, default: '0' },
    cardtype: { type: String, required: false, default: '' },
    cardnum: { type: String, required: false, default: '' },
    expdate: { type: String, required: false, default: '' },
    overideduenotices: { type: Boolean, required: false, default: false },
    disableemails: { type: String, required: false, default: '0' },
    client_id: { type: Number, required: false, default: 0 },
    currency_id: { type: Number, required: false, default: 0 },
    affiliate_id: { type: Number, required: false, default: 0 },
    group_name: { type: String, required: false, default: 'None' },
    group_color: { type: String, required: false, default: '#000000' },
    billing_contact_id: { type: Number, required: false, default: 0 },
    cardcreated: { type: String, required: false, default: '' },
    cardupdated: { type: String, required: false, default: '' },
    countryname: { type: String, required: true },
    assigned_affiliate: { type: Boolean, required: false, default: false },
    achtype: { type: String, required: false, default: '' },
    achaccount: { type: String, required: false, default: '' },
    achrouting: { type: String, required: false, default: '' },
    access: { type: Array, required: false, default: [] },
    accesstoken: { type: String, required: false },
    refreshtoken: { type: String, required: false },
    socketId: [String],
    role: {
      type: ObjectId,
      ref: 'roles'
    },
    verified: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.password;
  },
});

export default mongoose.model<UserModel>('user', UserSchema);
