import mongoose, { Schema, Document } from 'mongoose';
const Ticket = new mongoose.Schema({
    userDateIn: Array,
    DateIn: Number,
    DateOut: Number,
    leisureTime: String,
    userId: String,
    userDateOut: Array,
    isEnough: {Boolean, default: false},
  });
  
  // Create a model for the "users" collection using the schema
  const ticketForUser = mongoose.model('ticketForUser', Ticket);
  export default ticketForUser