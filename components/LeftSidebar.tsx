"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/customers", label: "Customers" },
  { href: "/bookings", label: "Bookings" },
  { href: "/payments", label: "Payments" },
  { href: "/food", label: "Food" },
  { href: "/reports", label: "Reports" },
  { href: "/admin-panel", label: "Admin Panel" },
];

export default function LeftSidebar() {
  const pathname = usePathname();

  return (
    <aside className="left-sidebar">
      <h2>Navigation</h2>
      <nav>
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={`nav-link${isActive ? " is-active" : ""}`}>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}