import { Model, Schema, model, models } from "mongoose";

export type ReminderDocument = {
  type: "Event tomorrow" | "Payment due";
  message: string;
  dueDate?: string;
  createdAt: Date;
  updatedAt: Date;
};

const reminderSchema = new Schema<ReminderDocument>(
  {
    type: { type: String, enum: ["Event tomorrow", "Payment due"], required: true },
    message: { type: String, required: true, trim: true },
    dueDate: { type: String },
  },
  { timestamps: true }
);

const Reminder = (models.Reminder as Model<ReminderDocument>) || model<ReminderDocument>("Reminder", reminderSchema);

export default Reminder;
