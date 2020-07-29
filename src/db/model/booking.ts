import { IBooking } from "./booking.interface";
import mongoose from "mongoose";

const _schema: mongoose.Schema = new mongoose.Schema({
  state: String,
  userId: String,
  createdAt: String,
  bookingStart: String,
  bookingEnd: String,
});

export type BookingType = IBooking & mongoose.Document;

export const BookingModel = mongoose.model<BookingType>("Bookings", _schema);
