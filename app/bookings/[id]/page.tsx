import Link from "next/link";
import { notFound } from "next/navigation";
import Booking from "@/models/Booking";
import FoodPlan from "@/models/FoodPlan";
import Invoice from "@/models/Invoice";
import Payment from "@/models/Payment";
import { connectToDatabase } from "@/lib/mongodb";

type BookingPageProps = {
  params: Promise<{ id: string }>;
};

function formatMoney(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

export default async function BookingDetailsPage({ params }: BookingPageProps) {
  const { id } = await params;
  await connectToDatabase();

  const booking = await Booking.findById(id).lean();
  if (!booking) {
    notFound();
  }

  const customerName = String(booking.customerName ?? "").trim();
  const customerId = booking.customerId ? String(booking.customerId) : "";

  const paymentFilter = customerId
    ? { $or: [{ customerId }, { customerName }] }
    : { customerName };

  const [payments, foodPlans, invoices] = await Promise.all([
    Payment.find(paymentFilter).sort({ createdAt: -1 }).lean(),
    FoodPlan.find({ customerName }).sort({ eventDate: 1, createdAt: -1 }).lean(),
    Invoice.find(paymentFilter).sort({ createdAt: -1 }).lean(),
  ]);

  return (
    <main className="dashboard-content" style={{ maxWidth: 920, margin: "20px auto", padding: "0 10px" }}>
      <section className="panel">
        <div className="section-title-row">
          <h2>Booking Details</h2>
          <Link href="/bookings" className="table-btn">
            Back to Bookings
          </Link>
        </div>

        <div className="form-grid booking-grid">
          <article className="metric-card compact">
            <h3>Customer</h3>
            <p>{booking.customerName}</p>
          </article>
          <article className="metric-card compact">
            <h3>Event Date</h3>
            <p>{booking.eventDate}</p>
          </article>
          <article className="metric-card compact">
            <h3>Event Type</h3>
            <p>{booking.eventType}</p>
          </article>
          <article className="metric-card compact">
            <h3>Guest Count</h3>
            <p>{booking.guests}</p>
          </article>
          <article className="metric-card compact">
            <h3>Hall</h3>
            <p>{booking.hall}</p>
          </article>
          <article className="metric-card compact">
            <h3>Status</h3>
            <p>
              <span className={`badge ${booking.status === "Confirmed" ? "booked" : "pending"}`}>
                {booking.status}
              </span>
            </p>
          </article>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 14 }}>
        <h2>Payment Details</h2>
        {payments.length === 0 ? (
          <p className="empty-note">No payment records found for this booking.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Total Amount</th>
                  <th>Paid</th>
                  <th>Remaining</th>
                  <th>Status</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((row) => (
                  <tr key={String(row._id)}>
                    <td>{formatMoney(Number(row.totalAmount ?? 0))}</td>
                    <td>{formatMoney(Number(row.paidAmount ?? 0))}</td>
                    <td>{formatMoney(Number(row.remainingAmount ?? 0))}</td>
                    <td>
                      <span className={`badge ${row.status === "Paid" ? "paid" : "danger"}`}>
                        {String(row.status ?? "Pending")}
                      </span>
                    </td>
                    <td>{String(row.dueDate ?? "-")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel" style={{ marginTop: 14 }}>
        <h2>Food Plan Details</h2>
        {foodPlans.length === 0 ? (
          <p className="empty-note">No food plan records found for this booking.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Menu Type</th>
                  <th>Guests</th>
                  <th>Food Quantity</th>
                  <th>Event Date</th>
                </tr>
              </thead>
              <tbody>
                {foodPlans.map((row) => (
                  <tr key={String(row._id)}>
                    <td>{String(row.menuType ?? "-")}</td>
                    <td>{Number(row.guests ?? 0)}</td>
                    <td>{String(row.foodQuantity ?? "-")}</td>
                    <td>{String(row.eventDate ?? "-")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel" style={{ marginTop: 14 }}>
        <h2>Invoice Details</h2>
        {invoices.length === 0 ? (
          <p className="empty-note">No invoice records found for this booking.</p>
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
                {invoices.map((row) => (
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
