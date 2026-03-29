import Link from "next/link";
import { notFound } from "next/navigation";
import Booking from "@/models/Booking";
import FoodPlan from "@/models/FoodPlan";
import Payment from "@/models/Payment";
import { connectToDatabase } from "@/lib/mongodb";

type FoodDetailsPageProps = {
  params: Promise<{ id: string }>;
};

function formatMoney(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

export default async function FoodDetailsPage({ params }: FoodDetailsPageProps) {
  const { id } = await params;
  await connectToDatabase();

  const foodPlan = await FoodPlan.findById(id).lean();
  if (!foodPlan) {
    notFound();
  }

  const customerName = String(foodPlan.customerName ?? "").trim();

  const [relatedBookings, relatedPayments] = await Promise.all([
    Booking.find({ customerName }).sort({ eventDate: 1 }).lean(),
    Payment.find({ customerName }).sort({ createdAt: -1 }).lean(),
  ]);

  return (
    <main className="dashboard-content" style={{ maxWidth: 920, margin: "20px auto", padding: "0 10px" }}>
      <section className="panel">
        <div className="section-title-row">
          <h2>Food Plan Details</h2>
          <Link href="/food" className="table-btn">
            Back to Food
          </Link>
        </div>

        <div className="form-grid booking-grid">
          <article className="metric-card compact">
            <h3>Customer</h3>
            <p>{customerName || "-"}</p>
          </article>
          <article className="metric-card compact">
            <h3>Menu Type</h3>
            <p>{String(foodPlan.menuType ?? "-")}</p>
          </article>
          <article className="metric-card compact">
            <h3>Guests</h3>
            <p>{Number(foodPlan.guests ?? 0)}</p>
          </article>
          <article className="metric-card compact">
            <h3>Food Quantity</h3>
            <p>{String(foodPlan.foodQuantity ?? "-")}</p>
          </article>
          <article className="metric-card compact">
            <h3>Event Date</h3>
            <p>{String(foodPlan.eventDate ?? "-")}</p>
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
        <h2>Related Payments</h2>
        {relatedPayments.length === 0 ? (
          <p className="empty-note">No related payments found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Total Amount</th>
                  <th>Paid</th>
                  <th>Remaining</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {relatedPayments.map((row) => (
                  <tr key={String(row._id)}>
                    <td>{formatMoney(Number(row.totalAmount ?? 0))}</td>
                    <td>{formatMoney(Number(row.paidAmount ?? 0))}</td>
                    <td>{formatMoney(Number(row.remainingAmount ?? 0))}</td>
                    <td>{String(row.status ?? "-")}</td>
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
