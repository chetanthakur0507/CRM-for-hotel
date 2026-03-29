import Link from "next/link";
import { notFound } from "next/navigation";
import Payment from "@/models/Payment";
import Booking from "@/models/Booking";
import Invoice from "@/models/Invoice";
import { connectToDatabase } from "@/lib/mongodb";

type PaymentDetailsPageProps = {
  params: Promise<{ id: string }>;
};

function formatMoney(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

export default async function PaymentDetailsPage({ params }: PaymentDetailsPageProps) {
  const { id } = await params;
  await connectToDatabase();

  const payment = await Payment.findById(id).lean();
  if (!payment) {
    notFound();
  }

  const customerName = String(payment.customerName ?? "").trim();
  const customerId = payment.customerId ? String(payment.customerId) : "";

  const sharedFilter = customerId ? { $or: [{ customerId }, { customerName }] } : { customerName };

  const [relatedBookings, relatedInvoices] = await Promise.all([
    Booking.find(sharedFilter).sort({ eventDate: 1 }).lean(),
    Invoice.find(sharedFilter).sort({ createdAt: -1 }).lean(),
  ]);

  return (
    <main className="dashboard-content" style={{ maxWidth: 920, margin: "20px auto", padding: "0 10px" }}>
      <section className="panel">
        <div className="section-title-row">
          <h2>Payment Details</h2>
          <Link href="/payments" className="table-btn">
            Back to Payments
          </Link>
        </div>

        <div className="form-grid booking-grid">
          <article className="metric-card compact">
            <h3>Customer</h3>
            <p>{customerName}</p>
          </article>
          <article className="metric-card compact">
            <h3>Total Amount</h3>
            <p>{formatMoney(Number(payment.totalAmount ?? 0))}</p>
          </article>
          <article className="metric-card compact">
            <h3>Paid Amount</h3>
            <p>{formatMoney(Number(payment.paidAmount ?? 0))}</p>
          </article>
          <article className="metric-card compact">
            <h3>Remaining</h3>
            <p>{formatMoney(Number(payment.remainingAmount ?? 0))}</p>
          </article>
          <article className="metric-card compact">
            <h3>Status</h3>
            <p>
              <span className={`badge ${payment.status === "Paid" ? "paid" : "danger"}`}>
                {String(payment.status ?? "Pending")}
              </span>
            </p>
          </article>
          <article className="metric-card compact">
            <h3>Due Date</h3>
            <p>{String(payment.dueDate ?? "-")}</p>
          </article>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 14 }}>
        <h2>Related Bookings</h2>
        {relatedBookings.length === 0 ? (
          <p className="empty-note">No related bookings found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Event Date</th>
                  <th>Event Type</th>
                  <th>Hall</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {relatedBookings.map((row) => (
                  <tr key={String(row._id)}>
                    <td>{String(row.eventDate ?? "-")}</td>
                    <td>{String(row.eventType ?? "-")}</td>
                    <td>{String(row.hall ?? "-")}</td>
                    <td>{String(row.status ?? "-")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel" style={{ marginTop: 14 }}>
        <h2>Related Invoices</h2>
        {relatedInvoices.length === 0 ? (
          <p className="empty-note">No related invoices found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Event Details</th>
                  <th>Total Amount</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {relatedInvoices.map((row) => (
                  <tr key={String(row._id)}>
                    <td>{String(row.eventDetails ?? "-")}</td>
                    <td>{formatMoney(Number(row.totalAmount ?? 0))}</td>
                    <td>{new Date(String(row.createdAt ?? "")).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
