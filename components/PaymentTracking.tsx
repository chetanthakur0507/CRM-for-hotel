"use client";

import { FormEvent } from "react";
import { Payment, Customer } from "@/lib/types";

interface PaymentFormData {
  customerId: string;
  customerName: string;
  totalAmount: string;
  paidAmount: string;
  dueDate: string;
}

interface PaymentTrackingProps {
  customers: Customer[];
  payments: Payment[];
  paymentForm: PaymentFormData;
  onFormChange: (form: PaymentFormData) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: (id: string) => void;
}

function formatMoney(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

export default function PaymentTracking({
  customers,
  payments,
  paymentForm,
  onFormChange,
  onSave,
  onDelete,
}: PaymentTrackingProps) {
  const totalPaid = payments.reduce((sum, row) => sum + row.paidAmount, 0);
  const pendingAmount = payments.reduce((sum, row) => sum + row.remainingAmount, 0);

  return (
    <section id="payments" className="panel">
      <h2>Payment Tracking</h2>
      <div className="split-cards">
        <article className="metric-card compact">
          <h3>Total Paid</h3>
          <p>{formatMoney(totalPaid)}</p>
        </article>
        <article className="metric-card compact">
          <h3>Pending Amount</h3>
          <p>{formatMoney(pendingAmount)}</p>
        </article>
      </div>

      <form className="form-grid admin-filter-grid" onSubmit={onSave}>
        <label htmlFor="p-customer">
          Customer
          <select
            id="p-customer"
            value={paymentForm.customerId}
            onChange={(event) =>
              onFormChange({ ...paymentForm, customerId: event.target.value })
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
        <label htmlFor="p-customer-name">
          Or Customer Name
          <input
            id="p-customer-name"
            type="text"
            value={paymentForm.customerName}
            onChange={(event) =>
              onFormChange({ ...paymentForm, customerName: event.target.value })
            }
          />
        </label>
        <label htmlFor="p-total">
          Total Amount
          <input
            id="p-total"
            type="number"
            value={paymentForm.totalAmount}
            onChange={(event) =>
              onFormChange({ ...paymentForm, totalAmount: event.target.value })
            }
          />
        </label>
        <label htmlFor="p-paid">
          Paid
          <input
            id="p-paid"
            type="number"
            value={paymentForm.paidAmount}
            onChange={(event) =>
              onFormChange({ ...paymentForm, paidAmount: event.target.value })
            }
          />
        </label>
        <label htmlFor="p-due">
          Due Date
          <input
            id="p-due"
            type="date"
            value={paymentForm.dueDate}
            onChange={(event) =>
              onFormChange({ ...paymentForm, dueDate: event.target.value })
            }
          />
        </label>
        <button type="submit" className="action-btn">
          Save Payment
        </button>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Total Amount</th>
              <th>Paid</th>
              <th>Remaining</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((row) => (
              <tr key={row._id}>
                <td>{row.customerName}</td>
                <td>{formatMoney(row.totalAmount)}</td>
                <td>{formatMoney(row.paidAmount)}</td>
                <td>{formatMoney(row.remainingAmount)}</td>
                <td>
                  <span className={`badge ${row.status === "Paid" ? "paid" : "danger"}`}>
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
