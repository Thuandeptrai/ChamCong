import mongoose, { Schema, Document } from 'mongoose';
import { ClientOrder } from '../interfaces';

export interface RoleModel extends ClientOrder, Document { }

const ClientOrderSchema: Schema = new Schema(
    {
        orders_id: {type: Number,},
        date_created: {type: String,},
        number: {type: Number,},
        total: {type: Number,},
        status: {type: String,},
        invoice_id: {type: String,},
        firstname: {type: String,},
        lastname: {type: String,},
        companyname: {type: String,},
        module: {type: String,},
        client_id: {type: String,},
        invtotal: { type: Number },
        invcredit: { type: Number },
        invstatus: {type: String,},
        group_id: {type: String,},
        invsubtotal2: { type: Number },
        currency_id: {type: String,},
        balance: {type: String,},
    },
    {
        timestamps: true,
        collection: 'clientOrders',
    }
);

ClientOrderSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    },
});

export default mongoose.model<RoleModel>('clientOrder', ClientOrderSchema);
