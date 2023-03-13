import mongoose, { Schema, Document }  from "mongoose"
import { SocketType } from "../interfaces"

export interface SocketModel extends SocketType, Document {}

const Socket:Schema = new Schema({
    user: [
        {
            type: mongoose.Types.ObjectId,
            default: []
        }
    ],
    socketId: [
        {
            type: String,
            default: []
        }
    ]
},{timestamps: true})


export default mongoose.model<SocketModel>('socket', Socket);
