export type Customer = {
  _id: string;
  name: string;
  phone: string;
  email: string;
};

export type Booking = {
  _id: string;
  customerId?: string;
  customerName: string;
  eventDate: string;
  eventType: string;
  guests: number;
  hall: string;
  status: "Confirmed" | "Pending";
};

export type Payment = {
  _id: string;
  customerId?: string;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "Paid" | "Pending";
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Reminder = {
  _id: string;
  type: "Event tomorrow" | "Payment due";
  message: string;
  dueDate?: string;
};

export type FoodPlan = {
  _id: string;
  customerName?: string;
  menuType: "Veg" | "Non-Veg";
  guests: number;
  foodQuantity: string;
  eventDate?: string;
};

export type Invoice = {
  _id: string;
  customerId?: string;
  customerName: string;
  eventDetails: string;
  amountBreakdown: string;
  totalAmount: number;
  createdAt?: string;
};
