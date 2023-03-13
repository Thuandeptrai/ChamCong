
import mongoose, {Schema, Document} from "mongoose";
import {DepartmentType} from '../interfaces'

export interface RoleModel extends DepartmentType, Document {}
// mongoose.set('strictQuery', true);

const DepartmentTypeSchema: Schema = new Schema(
    {
        name:{
            type: String,
            required: true,
            unique: true
        },
        code:{
            type: String,
           
        }
    },
    {
    timestamps: true,
    collection: 'departments',
  }
)

export default mongoose.model<RoleModel>('department', DepartmentTypeSchema)