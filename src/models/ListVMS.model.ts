import { number } from 'joi';
import mongoose, { Schema, Document } from 'mongoose';
import { ListVMSType } from '../interfaces';

// export interface any extends any, Document {}

const ListVMSSchema: Schema = new Schema(
  {
    service: {
      type: mongoose.Types.ObjectId,
      ref: 'Service',
    },

    service_id: { type: Number, required: true },
    client_id: { type: Number, required: false, default: 0 },
    object_id: { type: Number, required: true },
    ha: { type: Boolean },
    built: { type: Boolean },
    locked: { type: Boolean },
    power: { type: Boolean },
    status: { type: String },
    status_lang: { type: String },
    password: { type: Boolean },
    sshkeys: { type: Array },
    username: { type: Boolean },
    memory: { type: Number },
    disk: { type: Number },
    swap: { type: Number },
    uptime: { type: Number },
    template_id: { type: String },
    template_name: { type: String },
    template_data: { type: Array },
    replication: { type: Boolean },
    cloudinit: { type: Boolean },
    ipv4: { type: String },
    ipv6: { type: String },
    bandwidth: {
      data_received: { type: Number },
      data_sent: { type: Number },
    },
    label: { type: String },
    ip: {
      id: { type: Number },
      vmid: { type: Number },
      interface: { type: Number },
      ipaddress: { type: String },
      mac: { type: String },
      wanip: { type: String },
      ip: { type: String },
      network: { type: String },
      gateway: { type: String },
      main: { type: Number },
      options: {
        private: { type: Boolean },
        keep_mac: { type: Boolean },
      },
      server_id: { type: Number },
      type: { type: String },
    },
    cpus: { type: Number },
    invoice_id: { type: Number, required: false, default: 0 },
  },
  {
    timestamps: true,
    collection: 'ListVMSs',
  }
);

ListVMSSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.password;
  },
});

export default mongoose.model<any>('ListVMS', ListVMSSchema);
