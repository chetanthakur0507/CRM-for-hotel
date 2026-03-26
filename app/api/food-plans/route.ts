import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import FoodPlan from "@/models/FoodPlan";

function serialize(item: {
  _id: { toString: () => string };
  customerName?: string;
  menuType: "Veg" | "Non-Veg";
  guests: number;
  foodQuantity: string;
  eventDate?: string;
}) {
  return {
    _id: item._id.toString(),
    customerName: item.customerName,
    menuType: item.menuType,
    guests: item.guests,
    foodQuantity: item.foodQuantity,
    eventDate: item.eventDate,
  };
}

export async function GET() {
  await connectToDatabase();
  const rows = await FoodPlan.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(rows.map(serialize));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const customerName = String(body?.customerName ?? "").trim();
  const menuType = body?.menuType === "Non-Veg" ? "Non-Veg" : "Veg";
  const guests = Number(body?.guests ?? 0);
  const foodQuantity = String(body?.foodQuantity ?? "").trim();
  const eventDate = String(body?.eventDate ?? "").trim();

  if (guests <= 0 || !foodQuantity) {
    return NextResponse.json({ error: "Guests and food quantity are required" }, { status: 400 });
  }

  await connectToDatabase();
  const created = await FoodPlan.create({ customerName, menuType, guests, foodQuantity, eventDate });
  return NextResponse.json(serialize(created), { status: 201 });
}
