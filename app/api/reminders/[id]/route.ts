import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Reminder from "@/models/Reminder";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  await connectToDatabase();

  const deleted = await Reminder.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

fetch('/api/seed', { method: 'POST' }).then(r => r.json()).then(console.log)
