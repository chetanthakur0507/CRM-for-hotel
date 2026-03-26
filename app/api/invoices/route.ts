import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Invoice from "@/models/Invoice";

function serialize(item: {
  _id: { toString: () => string };
  customerId?: string;
  customerName: string;
  eventDetails: string;
  amountBreakdown: string;
  totalAmount: number;
  createdAt?: Date;
}) {
  return {
    _id: item._id.toString(),
    customerId: item.customerId,
    customerName: item.customerName,
    eventDetails: item.eventDetails,
    amountBreakdown: item.amountBreakdown,
    totalAmount: item.totalAmount,
    createdAt: item.createdAt,
  };
}

export async function GET() {
  await connectToDatabase();
  const rows = await Invoice.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(rows.map(serialize));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const customerId = String(body?.customerId ?? "").trim();
  const customerName = String(body?.customerName ?? "").trim();
  const eventDetails = String(body?.eventDetails ?? "").trim();
  const amountBreakdown = String(body?.amountBreakdown ?? "").trim();
  const totalAmount = Number(body?.totalAmount ?? 0);

  if (!customerName || !eventDetails || !amountBreakdown || totalAmount < 0) {
    return NextResponse.json({ error: "All invoice fields are required" }, { status: 400 });
  }

  await connectToDatabase();
  const created = await Invoice.create({ customerId, customerName, eventDetails, amountBreakdown, totalAmount });
  return NextResponse.json(serialize(created), { status: 201 });
}
