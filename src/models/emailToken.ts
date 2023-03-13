import mongoose, {Schema} from "mongoose";
import { EmailTokenType } from "../interfaces";

const EmailToken = new Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
    },
    token: {
        type: String, 
        required: true,
    },
    createdAt: {
        type: Date, 
        default: Date.now(), 
        expires: 3600, 
    }
})

export default mongoose.model<EmailTokenType>('emailtoken', EmailToken)