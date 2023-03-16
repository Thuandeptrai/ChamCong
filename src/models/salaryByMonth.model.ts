import mongoose, { Schema, Document } from 'mongoose';
const SalaryByMonth = new mongoose.Schema({
    month: String,
    totalWorkInMonth: Number,
    userId: {type: Schema.Types.ObjectId, ref: 'user'},
    salaryOfUser:Number,
  });
  
  // Create a model for the "users" collection using the schema
  const salaryByMonth = mongoose.model('salaryByMonth', SalaryByMonth);

  export default salaryByMonth