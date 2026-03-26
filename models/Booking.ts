import { Model, Schema, model, models } from "mongoose";

export type BookingDocument = {
  customerId?: string;
  customerName: string;
  eventDate: string;
  eventType: string;
  guests: number;
  hall: string;
  status: "Confirmed" | "Pending";
  createdAt: Date;
  updatedAt: Date;
};

const bookingSchema = new Schema<BookingDocument>(
  {
    customerId: { type: String, trim: true },
    customerName: { type: String, required: true, trim: true },
    eventDate: { type: String, required: true },
    eventType: { type: String, required: true, trim: true },
    guests: { type: Number, required: true, min: 1 },
    hall: { type: String, required: true, trim: true },
    status: { type: String, enum: ["Confirmed", "Pending"], default: "Pending" },
  },
  { timestamps: true }
);

const Booking = (models.Booking as Model<BookingDocument>) || model<BookingDocument>("Booking", bookingSchema);

export default Booking;
