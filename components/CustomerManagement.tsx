"use client";

import { FormEvent } from "react";
import { Customer } from "@/lib/types";

interface CustomerManagementProps {
  customers: Customer[];
  filteredCustomers: Customer[];
  customerForm: { name: string; phone: string; email: string };
  customerEditId: string | null;
  onFormChange: (form: { name: string; phone: string; email: string }) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export default function CustomerManagement({
  filteredCustomers,
  customerForm,
  customerEditId,
  onFormChange,
  onSave,
  onEdit,
  onDelete,
  onAdd,
}: CustomerManagementProps) {
  return (
    <section id="customers" className="panel">
      <div className="section-title-row">
        <h2>Customer Management</h2>
        <button type="button" className="action-btn" onClick={onAdd}>
          + Add Customer
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((row) => (
              <tr key={row._id}>
                <td>{row.name}</td>
                <td>{row.phone}</td>
                <td>{row.email}</td>
                <td>
                  <div className="row-actions">
                    <button
                      type="button"
                      className="table-btn"
                      onClick={() => onEdit(row)}
                    >
                      Edit ✏️
                    </button>
                    <button
                      type="button"
                      className="table-btn danger-btn"
                      onClick={() => onDelete(row._id)}
                    >
                      Delete 🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className="form-grid" onSubmit={onSave}>
        <label htmlFor="c-name">
          Name
          <input
            id="c-name"
            type="text"
            value={customerForm.name}
            onChange={(event) => onFormChange({ ...customerForm, name: event.target.value })}
          />
        </label>
        <label htmlFor="c-phone">
          Phone
          <input
            id="c-phone"
            type="tel"
            value={customerForm.phone}
            onChange={(event) => onFormChange({ ...customerForm, phone: event.target.value })}
          />
        </label>
        <label htmlFor="c-email">
          Email
          <input
            id="c-email"
            type="email"
            value={customerForm.email}
            onChange={(event) => onFormChange({ ...customerForm, email: event.target.value })}
          />
        </label>
        <button type="submit" className="action-btn">
          {customerEditId ? "Update Customer" : "Save Customer"}
        </button>
      </form>
    </section>
  );
}
