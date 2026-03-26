import { Model, Schema, model, models } from "mongoose";

export type InvoiceDocument = {
  customerId?: string;
  customerName: string;
  eventDetails: string;
  amountBreakdown: string;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
};

const invoiceSchema = new Schema<InvoiceDocument>(
  {
    customerId: { type: String, trim: true },
    customerName: { type: String, required: true, trim: true },
    eventDetails: { type: String, required: true, trim: true },
    amountBreakdown: { type: String, required: true, trim: true },
    totalAmount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const Invoice = (models.Invoice as Model<InvoiceDocument>) || model<InvoiceDocument>("Invoice", invoiceSchema);

export default Invoice;
