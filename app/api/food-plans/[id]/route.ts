import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import FoodPlan from "@/models/FoodPlan";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  await connectToDatabase();

  const deleted = await FoodPlan.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ error: "Food plan not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
