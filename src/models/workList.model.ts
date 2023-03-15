import mongoose, { Schema, Document } from 'mongoose';
const workRecord = new mongoose.Schema({
  dateWork: Number,
  workHour: Number,
  userId: String,
  isEnough: { Boolean, default: false },
});

// Create a model for the "users" collection using the schema
const workRecordForUser = mongoose.model('workRecord', workRecord);
export default workRecordForUser;
