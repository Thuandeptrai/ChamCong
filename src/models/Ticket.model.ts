import mongoose, { Schema, Document } from 'mongoose';
const Ticket = new mongoose.Schema({
    userDateIn: Number,
    DateIn: Number,
    DateOut: Number,
    userId: String,
    userDateOut: Number,
  });
  
  // Create a model for the "users" collection using the schema
  const ticketForUser = mongoose.model('ticketForUser', Ticket);
  export default ticketForUser