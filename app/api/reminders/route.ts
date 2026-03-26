import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Reminder from "@/models/Reminder";

function serialize(item: {
  _id: { toString: () => string };
  type: "Event tomorrow" | "Payment due";
  message: string;
  dueDate?: string;
}) {
  return {
    _id: item._id.toString(),
    type: item.type,
    message: item.message,
    dueDate: item.dueDate,
  };
}

export async function GET() {
  await connectToDatabase();
  const rows = await Reminder.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(rows.map(serialize));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const type = body?.type === "Payment due" ? "Payment due" : "Event tomorrow";
  const message = String(body?.message ?? "").trim();
  const dueDate = String(body?.dueDate ?? "").trim();

  if (!message) {
    return NextResponse.json({ error: "Reminder message is required" }, { status: 400 });
  }

  await connectToDatabase();
  const created = await Reminder.create({ type, message, dueDate });
  return NextResponse.json(serialize(created), { status: 201 });
}
