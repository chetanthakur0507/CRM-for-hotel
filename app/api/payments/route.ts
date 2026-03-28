import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Payment from "@/models/Payment";

function serialize(item: {
  _id: { toString: () => string };
  customerId?: string;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "Paid" | "Pending";
  dueDate?: string;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    _id: item._id.toString(),
    customerId: item.customerId,
    customerName: item.customerName,
    totalAmount: item.totalAmount,
    paidAmount: item.paidAmount,
    remainingAmount: item.remainingAmount,
    status: item.status,
    dueDate: item.dueDate,
    createdAt: item.createdAt?.toISOString(),
    updatedAt: item.updatedAt?.toISOString(),
  };
}

export async function GET() {
  await connectToDatabase();
  const rows = await Payment.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(rows.map(serialize));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const customerId = String(body?.customerId ?? "").trim();
  const customerName = String(body?.customerName ?? "").trim();
  const totalAmount = Number(body?.totalAmount ?? 0);
  const paidAmount = Number(body?.paidAmount ?? 0);
  const dueDate = String(body?.dueDate ?? "").trim();

  if (!customerName || totalAmount < 0 || paidAmount < 0 || paidAmount > totalAmount) {
    return NextResponse.json({ error: "Invalid payment values" }, { status: 400 });
  }

  const remainingAmount = Math.max(totalAmount - paidAmount, 0);
  const status = remainingAmount === 0 ? "Paid" : "Pending";

  await connectToDatabase();
  const created = await Payment.create({
    customerId,
    customerName,
    totalAmount,
    paidAmount,
    remainingAmount,
    status,
    dueDate,
  });

  return NextResponse.json(serialize(created), { status: 201 });
}
