import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Customer from "@/models/Customer";

function serializeCustomer(item: {
  _id: { toString: () => string };
  name: string;
  phone: string;
  email: string;
}) {
  return {
    _id: item._id.toString(),
    name: item.name,
    phone: item.phone,
    email: item.email,
  };
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null);

  const name = String(body?.name ?? "").trim();
  const phone = String(body?.phone ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();

  if (!name || !phone || !email) {
    return NextResponse.json({ error: "Name, phone and email are required" }, { status: 400 });
  }

  await connectToDatabase();

  const existingByEmail = await Customer.findOne({ email, _id: { $ne: id } }).lean();
  if (existingByEmail) {
    return NextResponse.json({ error: "Another customer already uses this email" }, { status: 409 });
  }

  const updated = await Customer.findByIdAndUpdate(
    id,
    { name, phone, email },
    { new: true, runValidators: true }
  );

  if (!updated) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  return NextResponse.json(serializeCustomer(updated));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  await connectToDatabase();
  const deleted = await Customer.findByIdAndDelete(id);

  if (!deleted) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
