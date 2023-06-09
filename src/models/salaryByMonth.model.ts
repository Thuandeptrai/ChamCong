import mongoose, { Schema, Document } from 'mongoose';
const SalaryByMonth = new mongoose.Schema({
    month: Number,
    totalWorkInMonth: Number,
    userId: {type: Schema.Types.ObjectId, ref: 'user'},
    salaryOfUser:Number,  
    year:Number,
    rateWorkByMonth: Number,
  });
  
  // Create a model for the "users" collection using the schema
  const salaryByMonth = mongoose.model('salaryByMonth', SalaryByMonth);

  export default salaryByMonth