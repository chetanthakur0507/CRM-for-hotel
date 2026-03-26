import { Model, Schema, model, models } from "mongoose";

export type CustomerDocument = {
  name: string;
  phone: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

const customerSchema = new Schema<CustomerDocument>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  },
  {
    timestamps: true,
  }
);

const Customer = (models.Customer as Model<CustomerDocument>) || model<CustomerDocument>("Customer", customerSchema);

export default Customer;
