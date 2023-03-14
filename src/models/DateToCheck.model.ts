import mongoose, { Schema, Document } from 'mongoose';
const DateToCheck = new mongoose.Schema({
    dateIn: Number,
    lateDate: Number,
    leisure: Number,
    dateOut: Number,
  });
  
  // Create a model for the "users" collection using the schema
  const dateToCheck = mongoose.model('dateToCheck', DateToCheck);

  export default dateToCheck