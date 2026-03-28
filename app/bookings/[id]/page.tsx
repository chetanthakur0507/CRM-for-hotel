import Link from "next/link";
import { notFound } from "next/navigation";
import Booking from "@/models/Booking";
import { connectToDatabase } from "@/lib/mongodb";

type BookingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BookingDetailsPage({ params }: BookingPageProps) {
  const { id } = await params;
  await connectToDatabase();

  const booking = await Booking.findById(id).lean();
  if (!booking) {
    notFound();
  }

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
    </main>
  );
}
