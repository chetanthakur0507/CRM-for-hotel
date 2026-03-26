import { Model, Schema, model, models } from "mongoose";

export type PaymentDocument = {
  customerId?: string;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "Paid" | "Pending";
  dueDate?: string;
  createdAt: Date;
  updatedAt: Date;
};

const paymentSchema = new Schema<PaymentDocument>(
  {
    customerId: { type: String, trim: true },
    customerName: { type: String, required: true, trim: true },
    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, required: true, min: 0 },
    remainingAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["Paid", "Pending"], required: true },
    dueDate: { type: String },
  },
  { timestamps: true }
);

const Payment = (models.Payment as Model<PaymentDocument>) || model<PaymentDocument>("Payment", paymentSchema);

export default Payment;
