"use client";

import Link from "next/link";

export default function LeftSidebar() {
  return (
    <aside className="left-sidebar">
      <h2>Navigation</h2>
      <nav>
        <Link href="/">Dashboard</Link>
        <Link href="/customers">Customers</Link>
        <Link href="/bookings">Bookings</Link>
        <Link href="/payments">Payments</Link>
        <Link href="/food">Food</Link>
        <Link href="/reports">Reports</Link>
        <Link href="/admin-panel">Admin Panel</Link>
      </nav>
    </aside>
  );
}