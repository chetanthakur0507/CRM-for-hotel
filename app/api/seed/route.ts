import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { seedData } from "@/lib/seed-data";
import Customer from "@/models/Customer";
import Booking from "@/models/Booking";
import Payment from "@/models/Payment";
import Reminder from "@/models/Reminder";
import FoodPlan from "@/models/FoodPlan";
import Invoice from "@/models/Invoice";

export async function POST() {
  try {
    await connectToDatabase();

    const customerCount = await Customer.countDocuments();
    if (customerCount > 0) {
      return NextResponse.json(
        { message: "Database already seeded. Delete collections to re-seed." },
        { status: 400 }
      );
    }

    const customers = await Customer.insertMany(seedData.customers);
    const customerMap = new Map(customers.map((doc) => [doc.name, doc._id.toString()]));

    const bookingsWithIds = seedData.bookings.map((booking) => ({
      ...booking,
      customerId: customerMap.get(booking.customerName),
    }));
    await Booking.insertMany(bookingsWithIds);

    const paymentsWithIds = seedData.payments.map((payment) => ({
      ...payment,
      customerId: customerMap.get(payment.customerName),
    }));
    await Payment.insertMany(paymentsWithIds);

    const remindersResult = await Reminder.insertMany(seedData.reminders);

    const foodPlansWithIds = seedData.foodPlans.map((food) => ({
      ...food,
      customerId: customerMap.get(food.customerName),
    }));
    await FoodPlan.insertMany(foodPlansWithIds);

    const invoicesWithIds = seedData.invoices.map((invoice) => ({
      ...invoice,
      customerId: customerMap.get(invoice.customerName),
    }));
    await Invoice.insertMany(invoicesWithIds);

    return NextResponse.json(
      {
        message: "Database seeded successfully!",
        counts: {
          customers: customers.length,
          bookings: bookingsWithIds.length,
          payments: paymentsWithIds.length,
          reminders: remindersResult.length,
          foodPlans: foodPlansWithIds.length,
          invoices: invoicesWithIds.length,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Seed failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
