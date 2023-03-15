import mongoose, { Schema, Document } from 'mongoose';
const Ticket = new mongoose.Schema({
    userDateIn: Array,
    DateIn: Number,
    DateOut: Number,
    leisureTimeStart:String,
    leisureTimeEnd:String,
    userId: String,
    userDateOut: Array,
  });
  
  // Create a model for the "users" collection using the schema
  const ticketForUser = mongoose.model('ticketForUser', Ticket);
  export default ticketForUser