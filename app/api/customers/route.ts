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

export async function GET() {
  await connectToDatabase();
  const customers = await Customer.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(customers.map(serializeCustomer));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const name = String(body?.name ?? "").trim();
  const phone = String(body?.phone ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();

  if (!name || !phone || !email) {
    return NextResponse.json({ error: "Name, phone and email are required" }, { status: 400 });
  }

  await connectToDatabase();

  const exists = await Customer.findOne({ email }).lean();
  if (exists) {
    return NextResponse.json({ error: "Customer with this email already exists" }, { status: 409 });
  }

  const created = await Customer.create({ name, phone, email });
  return NextResponse.json(serializeCustomer(created), { status: 201 });
}
