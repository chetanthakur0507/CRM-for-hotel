"use client";

import { FormEvent } from "react";
import { Booking, Customer } from "@/lib/types";

const halls = ["Emerald Hall", "Royal Ballroom", "Garden Pavilion"];
const eventTypes = ["Wedding", "Corporate", "Engagement", "Birthday", "Other"];

interface BookingFormData {
  customerId: string;
  customerName: string;
  eventDate: string;
  eventType: string;
  guests: string;
  hall: string;
  status: "Confirmed" | "Pending";
}

interface BookingManagementProps {
  customers: Customer[];
  bookings: Booking[];
  bookingForm: BookingFormData;
  onFormChange: (form: BookingFormData) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: (id: string) => void;
}

export default function BookingManagement({
  customers,
  bookings,
  bookingForm,
  onFormChange,
  onSave,
  onDelete,
}: BookingManagementProps) {
  return (
    <section id="bookings" className="panel">
      <h2>Booking Management</h2>
      <form className="form-grid booking-grid" onSubmit={onSave}>
        <label htmlFor="b-customer">
          Customer
          <select
            id="b-customer"
            value={bookingForm.customerId}
            onChange={(event) =>
              onFormChange({ ...bookingForm, customerId: event.target.value })
            }
          >
            <option value="">Select customer</option>
            {customers.map((row) => (
              <option key={row._id} value={row._id}>
                {row.name}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="b-customer-name">
          Or Customer Name
          <input
            id="b-customer-name"
            type="text"
            value={bookingForm.customerName}
            onChange={(event) =>
              onFormChange({ ...bookingForm, customerName: event.target.value })
            }
          />
        </label>
        <label htmlFor="b-date">
          Date picker 📅
          <input
            id="b-date"
            type="date"
            value={bookingForm.eventDate}
            onChange={(event) =>
              onFormChange({ ...bookingForm, eventDate: event.target.value })
            }
          />
        </label>
        <label htmlFor="b-type">
          Event Type
          <select
            id="b-type"
            value={bookingForm.eventType}
            onChange={(event) =>
              onFormChange({ ...bookingForm, eventType: event.target.value })
            }
          >
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="b-guests">
          Guest Count
          <input
            id="b-guests"
            type="number"
            value={bookingForm.guests}
            onChange={(event) =>
              onFormChange({ ...bookingForm, guests: event.target.value })
            }
          />
        </label>
        <label htmlFor="b-hall">
          Hall Selection
          <select
            id="b-hall"
            value={bookingForm.hall}
            onChange={(event) =>
              onFormChange({ ...bookingForm, hall: event.target.value })
            }
          >
            {halls.map((hall) => (
              <option key={hall} value={hall}>
                {hall}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="b-status">
          Status
          <select
            id="b-status"
            value={bookingForm.status}
            onChange={(event) =>
              onFormChange({
                ...bookingForm,
                status: event.target.value as "Confirmed" | "Pending",
              })
            }
          >
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
          </select>
        </label>
        <button type="submit" className="action-btn">
          Save Booking
        </button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Event Date</th>
              <th>Event Type</th>
              <th>Guests</th>
              <th>Hall</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((row) => (
              <tr key={row._id}>
                <td>{row.customerName}</td>
                <td>{row.eventDate}</td>
                <td>{row.eventType}</td>
                <td>{row.guests}</td>
                <td>{row.hall}</td>
                <td>
                  <span
                    className={`badge ${row.status === "Confirmed" ? "booked" : "pending"}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="table-btn danger-btn"
                    onClick={() => onDelete(row._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
