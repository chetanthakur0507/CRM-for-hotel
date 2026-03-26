import { Model, Schema, model, models } from "mongoose";

export type FoodPlanDocument = {
  customerName?: string;
  menuType: "Veg" | "Non-Veg";
  guests: number;
  foodQuantity: string;
  eventDate?: string;
  createdAt: Date;
  updatedAt: Date;
};

const foodPlanSchema = new Schema<FoodPlanDocument>(
  {
    customerName: { type: String, trim: true },
    menuType: { type: String, enum: ["Veg", "Non-Veg"], required: true },
    guests: { type: Number, required: true, min: 1 },
    foodQuantity: { type: String, required: true, trim: true },
    eventDate: { type: String },
  },
  { timestamps: true }
);

const FoodPlan = (models.FoodPlan as Model<FoodPlanDocument>) || model<FoodPlanDocument>("FoodPlan", foodPlanSchema);

export default FoodPlan;
