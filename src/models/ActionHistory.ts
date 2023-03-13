import mongoose , {Schema, Document} from "mongoose";
import { ActionHistoryType, ActionHistoryStatusType } from "../interfaces";

enum Status {
    "pending",
    "success",
    "failed"
}

const ActionHistory = new Schema({
    action: {
        type: String,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      status: {
        type: String,
        enum: Status
      },
      IP:{
        type: String
      },
      FP:{type: Object},
      createdAt: {
        type: Date,
      },
      successAt: {
        type: Date,
      },
})

export default mongoose.model<ActionHistoryType>('actionhistory', ActionHistory)