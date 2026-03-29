import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Payment from "@/models/Payment";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  await connectToDatabase();

  const payment = await Payment.findById(id).lean();
  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  return NextResponse.json(serialize(payment));
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
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
  const updated = await Payment.findByIdAndUpdate(
    id,
    { customerId, customerName, totalAmount, paidAmount, remainingAmount, status, dueDate },
    { returnDocument: "after", runValidators: true }
  ).lean();

  if (!updated) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  return NextResponse.json(serialize(updated));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  await connectToDatabase();

  const deleted = await Payment.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
