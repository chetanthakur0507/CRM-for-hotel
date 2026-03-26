"use client";

interface MetricsData {
  todayBookings: number;
  totalRevenue: number;
  pendingAmount: number;
  upcomingEvents: number;
}

interface ChartData {
  monthlyRevenue: Array<{ month: string; value: number }>;
  eventTypeLegend: string[];
}

interface DashboardProps {
  metrics: MetricsData;
  chartData: ChartData;
}

function formatMoney(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

export default function Dashboard({ metrics, chartData }: DashboardProps) {
  return (
    <>
      <section id="dashboard" className="dashboard-grid">
        <article className="metric-card">
          <h3>Today Bookings</h3>
          <p>{metrics.todayBookings}</p>
        </article>
        <article className="metric-card">
          <h3>Total Revenue</h3>
          <p>{formatMoney(metrics.totalRevenue)}</p>
        </article>
        <article className="metric-card">
          <h3>Pending Payments</h3>
          <p>{formatMoney(metrics.pendingAmount)}</p>
        </article>
        <article className="metric-card">
          <h3>Upcoming Events</h3>
          <p>{metrics.upcomingEvents}</p>
        </article>
      </section>

      <section className="panel chart-panel" id="reports">
        <div>
          <h2>Monthly Revenue</h2>
          <p>Live bar chart using payment entries</p>
          <div className="bar-chart" role="img" aria-label="Monthly revenue bar chart">
            {chartData.monthlyRevenue.map((item) => (
              <div key={item.month} className="bar-col">
                <div className="bar-fill" style={{ height: `${Math.max(item.value, 6)}%` }} />
                <span>{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2>Event Type Distribution</h2>
          <p>Live event split from booking data</p>
          <div className="pie-chart" role="img" aria-label="Event type distribution pie chart" />
          <ul className="legend-list">
            {chartData.eventTypeLegend.map((row) => (
              <li key={row}>{row}</li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}