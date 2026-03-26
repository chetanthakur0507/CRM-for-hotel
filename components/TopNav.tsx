"use client";

import Image from "next/image";

interface TopNavProps {
  search: string;
  onSearchChange: (value: string) => void;
  onLogout: () => void;
  logo?: string;
}

export default function TopNav({ search, onSearchChange, onLogout, logo }: TopNavProps) {
  return (
    <header className="top-nav">
      <div className="brand-wrap">
        {logo ? <Image src={logo} alt="The Great Callina Logo" width={54} height={54} className="logo-img" priority /> : null}
        <div className="brand-text">
          <p className="brand-kicker">Admin CRM</p>
          <h1>The Great Callina Banquet Hall</h1>
        </div>
      </div>
      <div className="nav-actions">
        <label className="search-wrap" htmlFor="global-search">
          <span>Search</span>
          <input
            id="global-search"
            type="search"
            placeholder="Customer, booking, invoice..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>
        <button type="button" className="icon-btn" aria-label="Notifications">
          N
        </button>
        <button type="button" className="profile-btn" onClick={onLogout}>
          <span className="profile-dot">A</span>
          Logout
        </button>
      </div>
    </header>
  );
}