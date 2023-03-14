import mongoose, { Schema, Document } from 'mongoose';
import { UserType } from '../interfaces';

const { ObjectId } = Schema.Types;

export interface UserModel extends UserType, Document {}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: false },
    password: { type: String, required: true },
    name: { type: String, required: false },
    bankName:{type: String, require: true},
    employeeNumber: { type: String, required: false, default: '' },
    userBankNumber: {type: String, require: true},
    salary: {type: Number, require: true},
    phonenumber: { type: String, required: false, default: '' },
    access: { type: Array, required: false, default: [] },
    accesstoken: { type: String, required: false },
    refreshtoken: { type: String, required: false },
    isAdmin:{type:String, default:false, required: false},
    department:{type:String, default:false, required: false},
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
