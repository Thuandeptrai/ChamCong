import mongoose, { Schema, Document } from 'mongoose';
const workRecord = new mongoose.Schema({
  dateWork: Number,
  workHour: Number,
  userId: {type: Schema.Types.ObjectId, ref: 'user'},
  isEnough: { Boolean, default: false },
  month: String
});

// Create a model for the "users" collection using the schema
const workRecordForUser = mongoose.model('workRecord', workRecord);
export default workRecordForUser;
