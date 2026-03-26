"use client";

const eventTypes = ["Wedding", "Corporate", "Engagement", "Birthday", "Other"];

export default function AdminPanel() {
  return (
    <section className="panel">
      <h2>Admin Panel</h2>
      <form className="form-grid admin-filter-grid">
        <label htmlFor="f-date-from">
          Date Range (From)
          <input id="f-date-from" type="date" />
        </label>
        <label htmlFor="f-date-to">
          Date Range (To)
          <input id="f-date-to" type="date" />
        </label>
        <label htmlFor="f-type">
          Event Type Filter
          <select id="f-type" defaultValue="All">
            <option>All</option>
            {eventTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
      </form>
      <div className="admin-note">Analytics cards and chart values above are now calculated from live database records.</div>
    </section>
  );
}
