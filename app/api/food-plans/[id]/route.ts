import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import FoodPlan from "@/models/FoodPlan";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  await connectToDatabase();

  const foodPlan = await FoodPlan.findById(id).lean();
  if (!foodPlan) {
    return NextResponse.json({ error: "Food plan not found" }, { status: 404 });
  }

  return NextResponse.json(serialize(foodPlan));
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  const customerName = String(body?.customerName ?? "").trim();
  const menuType = body?.menuType === "Non-Veg" ? "Non-Veg" : "Veg";
  const guests = Number(body?.guests ?? 0);
  const foodQuantity = String(body?.foodQuantity ?? "").trim();
  const eventDate = String(body?.eventDate ?? "").trim();

  if (guests <= 0 || !foodQuantity) {
    return NextResponse.json({ error: "Food plan form is incomplete" }, { status: 400 });
  }

  await connectToDatabase();
  const updated = await FoodPlan.findByIdAndUpdate(
    id,
    { customerName, menuType, guests, foodQuantity, eventDate },
    { returnDocument: "after", runValidators: true }
  ).lean();

  if (!updated) {
    return NextResponse.json({ error: "Food plan not found" }, { status: 404 });
  }

  return NextResponse.json(serialize(updated));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  await connectToDatabase();

  const deleted = await FoodPlan.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ error: "Food plan not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
