"use client";

import { FormEvent } from "react";
import { Reminder } from "@/lib/types";

interface ReminderFormData {
  type: "Event tomorrow" | "Payment due";
  message: string;
  dueDate: string;
}

interface ReminderSystemProps {
  reminders: Reminder[];
  reminderForm: ReminderFormData;
  onFormChange: (form: ReminderFormData) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: (id: string) => void;
}

export default function ReminderSystem({
  reminders,
  reminderForm,
  onFormChange,
  onSave,
  onDelete,
}: ReminderSystemProps) {
  return (
    <section className="panel">
      <h2>Reminder System</h2>
      <form className="form-grid admin-filter-grid" onSubmit={onSave}>
        <label htmlFor="r-type">
          Reminder Type
          <select
            id="r-type"
            value={reminderForm.type}
            onChange={(event) =>
              onFormChange({
                ...reminderForm,
                type: event.target.value as "Event tomorrow" | "Payment due",
              })
            }
          >
            <option value="Event tomorrow">Event tomorrow</option>
            <option value="Payment due">Payment due</option>
          </select>
        </label>
        <label htmlFor="r-message">
          Message
          <input
            id="r-message"
            type="text"
            value={reminderForm.message}
            onChange={(event) =>
              onFormChange({ ...reminderForm, message: event.target.value })
            }
          />
        </label>
        <label htmlFor="r-date">
          Due Date
          <input
            id="r-date"
            type="date"
            value={reminderForm.dueDate}
            onChange={(event) =>
              onFormChange({ ...reminderForm, dueDate: event.target.value })
            }
          />
        </label>
        <button type="submit" className="action-btn">
          Save Reminder
        </button>
      </form>

      <ul className="reminder-list">
        {reminders.map((row) => (
          <li key={row._id}>
            🔔 {row.type}: {row.message} {row.dueDate ? `(${row.dueDate})` : ""}
            <button
              type="button"
              className="table-btn danger-btn"
              onClick={() => onDelete(row._id)}
              style={{ marginLeft: 10 }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
