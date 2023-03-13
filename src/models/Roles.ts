import mongoose , {Schema, Document} from "mongoose";
import { RoleType } from "../interfaces";


const Role = new Schema({
    code: {
        type: String,
    },
    roleName: {
        type: String,
        required: true,
        unique: true
    },

},{
    timestamps: true
})

export default mongoose.model<RoleType>('roles', Role)