import mongoose, {Schema} from "mongoose";
import { INotification } from "../interfaces";

const Notification = new Schema({
    code:{
        type: String,
    },
    name: {
        type: String,
    },
    slug: {
        type: String,
    },
    type: {
        type: String,
    },
    reciever:[{
        type: mongoose.Types.ObjectId, 
        ref: 'Users'
    }],
    sender:{
        type: mongoose.Types.ObjectId,
        ref: 'user'
    },
    content: {
        type: String,
    },
    createdTime: {
        type: Date,
        default: Date.now
    },
    updatedTime: {
        type: Date
    },
    status: {
        type: Boolean,
        default: false
    },
    readBy: {
        type: [mongoose.Types.ObjectId]
    }
}, {versionKey: false, timestamps: true})

export default mongoose.model<INotification>('notification', Notification)