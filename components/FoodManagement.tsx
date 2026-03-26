"use client";

import { FormEvent } from "react";
import { FoodPlan } from "@/lib/types";

interface FoodFormData {
  customerName: string;
  menuType: "Veg" | "Non-Veg";
  guests: string;
  eventDate: string;
}

interface FoodManagementProps {
  foodPlans: FoodPlan[];
  foodForm: FoodFormData;
  foodQuantity: string;
  onFormChange: (form: FoodFormData) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: (id: string) => void;
}

export default function FoodManagement({
  foodPlans,
  foodForm,
  foodQuantity,
  onFormChange,
  onSave,
  onDelete,
}: FoodManagementProps) {
  return (
    <section id="food" className="panel">
      <h2>Food Management</h2>
      <form className="form-grid booking-grid" onSubmit={onSave}>
        <label htmlFor="food-customer">
          Customer Name
          <input
            id="food-customer"
            type="text"
            value={foodForm.customerName}
            onChange={(event) =>
              onFormChange({ ...foodForm, customerName: event.target.value })
            }
          />
        </label>
        <label htmlFor="food-menu">
          Menu Selection
          <select
            id="food-menu"
            value={foodForm.menuType}
            onChange={(event) =>
              onFormChange({
                ...foodForm,
                menuType: event.target.value as "Veg" | "Non-Veg",
              })
            }
          >
            <option value="Veg">Veg</option>
            <option value="Non-Veg">Non-Veg</option>
          </select>
        </label>
        <label htmlFor="food-guests">
          Guests
          <input
            id="food-guests"
            type="number"
            value={foodForm.guests}
            onChange={(event) =>
              onFormChange({ ...foodForm, guests: event.target.value })
            }
          />
        </label>
        <label htmlFor="food-event">
          Event Date
          <input
            id="food-event"
            type="date"
            value={foodForm.eventDate}
            onChange={(event) =>
              onFormChange({ ...foodForm, eventDate: event.target.value })
            }
          />
        </label>
        <label htmlFor="food-qty">
          Auto Food Quantity
          <input id="food-qty" type="text" value={foodQuantity} readOnly />
        </label>
        <button type="submit" className="action-btn">
          Save Food Plan
        </button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Menu</th>
              <th>Guests</th>
              <th>Food Amount</th>
              <th>Event Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {foodPlans.map((row) => (
              <tr key={row._id}>
                <td>{row.customerName || "-"}</td>
                <td>{row.menuType}</td>
                <td>{row.guests}</td>
                <td>{row.foodQuantity}</td>
                <td>{row.eventDate || "-"}</td>
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
