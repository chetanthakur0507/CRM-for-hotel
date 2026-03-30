"use client";

import { useMemo, useState } from "react";
import { Booking, FoodPlan, Invoice, Payment } from "@/lib/types";

const eventTypes = ["All", "Wedding", "Corporate", "Engagement", "Birthday", "Other"];

type AdminFilter = {
  dateFrom: string;
  dateTo: string;
  eventType: string;
  hall: string;
  bookingStatus: "All" | "Confirmed" | "Pending";
  paymentStatus: "All" | "Paid" | "Pending";
  customerSearch: string;
};

interface AdminPanelProps {
  bookings: Booking[];
  payments: Payment[];
  foodPlans: FoodPlan[];
  invoices: Invoice[];
}

function formatMoney(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function downloadCsv(filename: string, rows: string[][]) {
  const content = rows
    .map((row) =>
      row
        .map((cell) => {
          const safe = String(cell ?? "").replaceAll('"', '""');
          return `"${safe}"`;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminPanel({ bookings, payments, foodPlans, invoices }: AdminPanelProps) {
  const defaultFilter: AdminFilter = {
    dateFrom: "",
    dateTo: "",
    eventType: "All",
    hall: "All",
    bookingStatus: "All",
    paymentStatus: "All",
    customerSearch: "",
  };

  const [draftFilter, setDraftFilter] = useState<AdminFilter>(defaultFilter);
  const [appliedFilter, setAppliedFilter] = useState<AdminFilter>(defaultFilter);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const halls = useMemo(() => {
    return ["All", ...Array.from(new Set(bookings.map((row) => row.hall).filter(Boolean)))];
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((row) => {
      if (appliedFilter.dateFrom && row.eventDate < appliedFilter.dateFrom) return false;
      if (appliedFilter.dateTo && row.eventDate > appliedFilter.dateTo) return false;
      if (appliedFilter.eventType !== "All" && row.eventType !== appliedFilter.eventType) return false;
      if (appliedFilter.hall !== "All" && row.hall !== appliedFilter.hall) return false;
      if (appliedFilter.bookingStatus !== "All" && row.status !== appliedFilter.bookingStatus) return false;
      if (
        appliedFilter.customerSearch &&
        !row.customerName.toLowerCase().includes(appliedFilter.customerSearch.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [bookings, appliedFilter]);

  const filteredPayments = useMemo(() => {
    return payments.filter((row) => {
      const dueDate = row.dueDate ?? "";
      if (appliedFilter.dateFrom && dueDate && dueDate < appliedFilter.dateFrom) return false;
      if (appliedFilter.dateTo && dueDate && dueDate > appliedFilter.dateTo) return false;
      if (appliedFilter.paymentStatus !== "All" && row.status !== appliedFilter.paymentStatus) return false;
      if (
        appliedFilter.customerSearch &&
        !row.customerName.toLowerCase().includes(appliedFilter.customerSearch.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [payments, appliedFilter]);

  const filteredFoodPlans = useMemo(() => {
    return foodPlans.filter((row) => {
      const eventDate = row.eventDate ?? "";
      if (appliedFilter.dateFrom && eventDate && eventDate < appliedFilter.dateFrom) return false;
      if (appliedFilter.dateTo && eventDate && eventDate > appliedFilter.dateTo) return false;
      if (
        appliedFilter.customerSearch &&
        !(row.customerName ?? "").toLowerCase().includes(appliedFilter.customerSearch.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [foodPlans, appliedFilter]);

  const kpis = useMemo(() => {
    const confirmed = filteredBookings.filter((row) => row.status === "Confirmed").length;
    const pending = filteredBookings.filter((row) => row.status === "Pending").length;
    const totalRevenue = filteredPayments.reduce((sum, row) => sum + row.paidAmount, 0);
    const pendingDues = filteredPayments.reduce((sum, row) => sum + row.remainingAmount, 0);
    const upcoming7DaysEnd = new Date();
    upcoming7DaysEnd.setDate(upcoming7DaysEnd.getDate() + 7);
    const upcomingEvents = filteredBookings.filter((row) => {
      const event = new Date(row.eventDate);
      return event >= new Date(todayISO()) && event <= upcoming7DaysEnd;
    }).length;
    const avgRevenue = filteredBookings.length === 0 ? 0 : Math.round(totalRevenue / filteredBookings.length);
    return { confirmed, pending, totalRevenue, pendingDues, upcomingEvents, avgRevenue };
  }, [filteredBookings, filteredPayments]);

  const monthlyRevenue = useMemo(() => {
    const monthMap = new Map<string, number>();
    for (const row of filteredPayments) {
      const sourceDate = row.dueDate ? new Date(row.dueDate) : row.createdAt ? new Date(row.createdAt) : new Date();
      const key = `${sourceDate.getFullYear()}-${String(sourceDate.getMonth() + 1).padStart(2, "0")}`;
      monthMap.set(key, (monthMap.get(key) ?? 0) + row.paidAmount);
    }

    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return {
        key,
        month: date.toLocaleString("en-US", { month: "short" }),
      };
    });

    const values = months.map((m) => monthMap.get(m.key) ?? 0);
    const maxValue = Math.max(...values, 1);

    return months.map((m, index) => ({
      month: m.month,
      amount: values[index],
      value: Math.round((values[index] / maxValue) * 100),
    }));
  }, [filteredPayments]);

  const hallSplit = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of filteredBookings) {
      counts.set(row.hall, (counts.get(row.hall) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [filteredBookings]);

  const eventTypeSplit = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of filteredBookings) {
      counts.set(row.eventType, (counts.get(row.eventType) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [filteredBookings]);

  const conflicts = useMemo(() => {
    const map = new Map<string, { date: string; hall: string; customers: string[] }>();
    for (const row of filteredBookings) {
      const key = `${row.eventDate}__${row.hall}`;
      const existing = map.get(key);
      if (existing) {
        existing.customers.push(row.customerName);
      } else {
        map.set(key, { date: row.eventDate, hall: row.hall, customers: [row.customerName] });
      }
    }
    return Array.from(map.values()).filter((row) => row.customers.length > 1);
  }, [filteredBookings]);

  const overduePayments = useMemo(() => {
    const today = todayISO();
    return filteredPayments.filter((row) => (row.dueDate ?? "") < today && row.remainingAmount > 0);
  }, [filteredPayments]);

  const nearDuePayments = useMemo(() => {
    const today = new Date(todayISO());
    const max = new Date(today);
    max.setDate(max.getDate() + 7);
    return filteredPayments.filter((row) => {
      if (!row.dueDate || row.remainingAmount <= 0) return false;
      const due = new Date(row.dueDate);
      return due >= today && due <= max;
    });
  }, [filteredPayments]);

  const missingFoodPlans = useMemo(() => {
    const foodIndex = new Set(filteredFoodPlans.map((row) => `${row.customerName ?? ""}__${row.eventDate ?? ""}`));
    return filteredBookings.filter((row) => row.status === "Confirmed" && !foodIndex.has(`${row.customerName}__${row.eventDate}`));
  }, [filteredBookings, filteredFoodPlans]);

  const menuDistribution = useMemo(() => {
    const veg = filteredFoodPlans.filter((row) => row.menuType === "Veg").length;
    const nonVeg = filteredFoodPlans.filter((row) => row.menuType === "Non-Veg").length;
    return { veg, nonVeg };
  }, [filteredFoodPlans]);

  const calendarRows = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const firstWeekDay = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const eventsByDate = new Map<string, number>();
    for (const row of filteredBookings) {
      if (!row.eventDate) continue;
      eventsByDate.set(row.eventDate, (eventsByDate.get(row.eventDate) ?? 0) + 1);
    }

    const cells: Array<{ day: number | null; date: string; count: number }> = [];
    for (let i = 0; i < firstWeekDay; i += 1) {
      cells.push({ day: null, date: "", count: 0 });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = formatDate(new Date(year, month, day));
      cells.push({ day, date, count: eventsByDate.get(date) ?? 0 });
    }

    while (cells.length % 7 !== 0) {
      cells.push({ day: null, date: "", count: 0 });
    }

    const rows: Array<Array<{ day: number | null; date: string; count: number }>> = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }

    return rows;
  }, [calendarMonth, filteredBookings]);

  const alertCount = conflicts.length + overduePayments.length + missingFoodPlans.length;

  return (
    <section className="panel">
      <div className="section-title-row">
        <h2>Admin Panel</h2>
        <span className="badge pending">Alerts {alertCount}</span>
      </div>

      <section className="panel" style={{ marginTop: 10 }}>
        <div className="section-title-row">
          <h2>Event Calendar</h2>
          <div className="row-actions">
            <button type="button" className="table-btn" onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>Prev</button>
            <span className="action-inline">{calendarMonth.toLocaleString("en-US", { month: "long", year: "numeric" })}</span>
            <button type="button" className="table-btn" onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>Next</button>
          </div>
        </div>
        <div className="table-wrap">
          <table className="admin-calendar-table">
            <thead>
              <tr>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <th key={day}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calendarRows.map((row, rowIndex) => (
                <tr key={`week-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${cell.date}-${rowIndex}-${cellIndex}`}>
                      <div className={`admin-calendar-cell ${cell.count > 0 ? "has-event" : ""}`}>
                        {cell.day ? <span>{cell.day}</span> : null}
                        {cell.count > 0 ? <small>{`${cell.count} event`}{cell.count > 1 ? "s" : ""}</small> : null}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <form
        className="form-grid admin-filter-grid"
        onSubmit={(event) => {
          event.preventDefault();
          setAppliedFilter(draftFilter);
        }}
      >
        <label htmlFor="f-date-from">
          Date Range (From)
          <input
            id="f-date-from"
            type="date"
            value={draftFilter.dateFrom}
            onChange={(event) => setDraftFilter((prev) => ({ ...prev, dateFrom: event.target.value }))}
          />
        </label>
        <label htmlFor="f-date-to">
          Date Range (To)
          <input
            id="f-date-to"
            type="date"
            value={draftFilter.dateTo}
            onChange={(event) => setDraftFilter((prev) => ({ ...prev, dateTo: event.target.value }))}
          />
        </label>
        <label htmlFor="f-type">
          Event Type
          <select
            id="f-type"
            value={draftFilter.eventType}
            onChange={(event) => setDraftFilter((prev) => ({ ...prev, eventType: event.target.value }))}
          >
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="f-hall">
          Hall
          <select
            id="f-hall"
            value={draftFilter.hall}
            onChange={(event) => setDraftFilter((prev) => ({ ...prev, hall: event.target.value }))}
          >
            {halls.map((hall) => (
              <option key={hall} value={hall}>
                {hall}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="f-booking-status">
          Booking Status
          <select
            id="f-booking-status"
            value={draftFilter.bookingStatus}
            onChange={(event) =>
              setDraftFilter((prev) => ({ ...prev, bookingStatus: event.target.value as AdminFilter["bookingStatus"] }))
            }
          >
            <option value="All">All</option>
            <option value="Confirmed">Confirme</option>
            <option value="Pending">Pending</option>
          </select>
        </label>
        <label htmlFor="f-payment-status">
          Payment Status
          <select
            id="f-payment-status"
            value={draftFilter.paymentStatus}
            onChange={(event) =>
              setDraftFilter((prev) => ({ ...prev, paymentStatus: event.target.value as AdminFilter["paymentStatus"] }))
            }
          >
            <option value="All">All</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </label>
        <label htmlFor="f-customer-search">
          Customer Search
          <input
            id="f-customer-search"
            type="text"
            placeholder="Name..."
            value={draftFilter.customerSearch}
            onChange={(event) => setDraftFilter((prev) => ({ ...prev, customerSearch: event.target.value }))}
          />
        </label>
        <button type="submit" className="action-btn">
          Apply Filters
        </button>
        <button
          type="button"
          className="table-btn"
          onClick={() => {
            setDraftFilter(defaultFilter);
            setAppliedFilter(defaultFilter);
          }}
        >
          Reset
        </button>
      </form>

      <section className="admin-kpi-grid" style={{ marginTop: 14 }}>
        <article className="metric-card compact"><h3>Total Bookings</h3><p>{filteredBookings.length}</p></article>
        <article className="metric-card compact"><h3>Confirmed / Pending</h3><p>{`${kpis.confirmed} / ${kpis.pending}`}</p></article>
        <article className="metric-card compact"><h3>Total Revenue</h3><p>{formatMoney(kpis.totalRevenue)}</p></article>
        <article className="metric-card compact"><h3>Pending Dues</h3><p>{formatMoney(kpis.pendingDues)}</p></article>
        <article className="metric-card compact"><h3>Upcoming 7 Days</h3><p>{kpis.upcomingEvents}</p></article>
        <article className="metric-card compact"><h3>Avg Revenue/Booking</h3><p>{formatMoney(kpis.avgRevenue)}</p></article>
      </section>

      <section className="panel" style={{ marginTop: 14 }}>
        <h2>Revenue Trend (Filtered)</h2>
        <div className="bar-chart" role="img" aria-label="Admin monthly revenue chart">
          {monthlyRevenue.map((item) => (
            <div key={item.month} className="bar-col">
              <span className="bar-amount">{formatMoney(item.amount)}</span>
              <div className="bar-fill" style={{ height: `${Math.max(item.value, 6)}%` }} />
              <span className="bar-month">{item.month}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel" style={{ marginTop: 14 }}>
        <h2>Hall Occupancy Split</h2>
        <ul className="legend-list">
          {hallSplit.length === 0 ? <li>No data</li> : hallSplit.map(([hall, count]) => <li key={hall}>{`${hall}: ${count}`}</li>)}
        </ul>
        <h2 style={{ marginTop: 10 }}>Event Type Split</h2>
        <ul className="legend-list">
          {eventTypeSplit.length === 0 ? <li>No data</li> : eventTypeSplit.map(([type, count]) => <li key={type}>{`${type}: ${count}`}</li>)}
        </ul>
      </section>

      <section className="admin-two-col" style={{ marginTop: 14 }}>
        <article className="panel">
          <h2>Conflict Monitor (Same Date + Hall)</h2>
          {conflicts.length === 0 ? (
            <p className="empty-note">No conflicts in current filter range.</p>
          ) : (
            <ul className="legend-list">
              {conflicts.map((row) => (
                <li key={`${row.date}-${row.hall}`}>{`${row.date} | ${row.hall} | ${row.customers.length} bookings`}</li>
              ))}
            </ul>
          )}
        </article>

        <article className="panel">
          <h2>Payment Watch</h2>
          <p className="status-text">Overdue: {overduePayments.length} | Due in 7 days: {nearDuePayments.length}</p>
          <ul className="legend-list">
            {overduePayments.slice(0, 6).map((row) => (
              <li key={row._id}>{`${row.customerName} - Due ${row.dueDate ?? "-"} - ${formatMoney(row.remainingAmount)} pending`}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="admin-two-col" style={{ marginTop: 14 }}>
        <article className="panel">
          <h2>Food Planning Overview</h2>
          <p className="status-text">Veg: {menuDistribution.veg} | Non-Veg: {menuDistribution.nonVeg}</p>
          <p className="status-text">Missing food plan for confirmed events: {missingFoodPlans.length}</p>
          <ul className="legend-list">
            {missingFoodPlans.slice(0, 6).map((row) => (
              <li key={row._id}>{`${row.customerName} - ${row.eventDate} (${row.hall})`}</li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <h2>Reports Export</h2>
          <div className="row-actions">
            <button
              type="button"
              className="table-btn"
              onClick={() =>
                downloadCsv("filtered-bookings.csv", [
                  ["Customer", "Event Date", "Event Type", "Hall", "Guests", "Status"],
                  ...filteredBookings.map((row) => [row.customerName, row.eventDate, row.eventType, row.hall, String(row.guests), row.status]),
                ])
              }
            >
              Export Bookings CSV
            </button>
            <button
              type="button"
              className="table-btn"
              onClick={() =>
                downloadCsv("filtered-payments.csv", [
                  ["Customer", "Total", "Paid", "Remaining", "Status", "Due Date"],
                  ...filteredPayments.map((row) => [
                    row.customerName,
                    String(row.totalAmount),
                    String(row.paidAmount),
                    String(row.remainingAmount),
                    row.status,
                    row.dueDate ?? "",
                  ]),
                ])
              }
            >
              Export Payments CSV
            </button>
          </div>
          <div className="admin-note" style={{ marginTop: 12 }}>
            Filtered records: {filteredBookings.length} bookings, {filteredPayments.length} payments, {filteredFoodPlans.length} food plans, {invoices.length} invoices loaded.
          </div>
        </article>
      </section>
    </section>
  );
}
