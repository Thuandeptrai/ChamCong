import mongoose, { Schema, Document } from 'mongoose';
import { ClientTicketType } from '../interfaces';

export interface RoleModel extends ClientTicketType, Document {}

const ClientTicketSchema: Schema = new Schema(
    {
        admin_read: {type: Number,},
        ticket_id:{type: Number,},
        parent_id:{type: Number,},
        type: {type: String},
        firstname: {type: String},
        lastname: {type: String},
        companyname: {type: String},
        date: {type: String},
        lastreply: {type: String},
        dept_id:{type: Number,},
        name: {type: String},
        client_id:{type: Number,},
        status: {type: String},
        ticket_number:{type: Number,},
        request_type: {type: String},
        tsubject: {type: String},
        deptname: {type: String},
        priority:{type: Number,},
        flags:{type: Number,},
        escalated:{type: Number},
        tags:{type: Number,},
        creator_id:{type: Number,},
        owner_id:{type: Number,},
        group_id:{type: Number,},
        client_parent:{type: Number,},
        rpname: {type: String},
        last_reply:{type: Number,},
        status_color: {type: String},
        lastreply_date: {type: String},
    },
    {
      timestamps: true,
      collection: 'clientTickets',
    }
  );
  
  ClientTicketSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
      delete ret._id;
    },
  });
  
  export default mongoose.model<RoleModel>('clientTicket', ClientTicketSchema);