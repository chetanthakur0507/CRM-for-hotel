import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";

function serialize(item: {
  _id: { toString: () => string };
  customerId?: string;
  customerName: string;
  eventDate: string;
  eventType: string;
  guests: number;
  hall: string;
  status: "Confirmed" | "Pending";
}) {
  return {
    _id: item._id.toString(),
    customerId: item.customerId,
    customerName: item.customerName,
    eventDate: item.eventDate,
    eventType: item.eventType,
    guests: item.guests,
    hall: item.hall,
    status: item.status,
  };
}

export async function GET() {
  await connectToDatabase();
  const rows = await Booking.find().sort({ eventDate: 1 }).lean();
  return NextResponse.json(rows.map(serialize));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const customerId = String(body?.customerId ?? "").trim();
  const customerName = String(body?.customerName ?? "").trim();
  const eventDate = String(body?.eventDate ?? "").trim();
  const eventType = String(body?.eventType ?? "").trim();
  const guests = Number(body?.guests ?? 0);
  const hall = String(body?.hall ?? "").trim();
  const status = body?.status === "Confirmed" ? "Confirmed" : "Pending";

  if (!customerName || !eventDate || !eventType || guests <= 0 || !hall) {
    return NextResponse.json({ error: "All booking fields are required" }, { status: 400 });
  }

  await connectToDatabase();
  const created = await Booking.create({ customerId, customerName, eventDate, eventType, guests, hall, status });

  return NextResponse.json(serialize(created), { status: 201 });
}
