import mongoose, { Schema, Document } from 'mongoose';
const DateToCheck = new mongoose.Schema({
    dateIn: String,
    lateDate: String,
    leisure: String,
    dateOut: String,
  });
  
  // Create a model for the "users" collection using the schema
  const dateToCheck = mongoose.model('dateToCheck', DateToCheck);

  export default dateToCheck