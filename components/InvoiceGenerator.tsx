"use client";

import { Invoice, Customer } from "@/lib/types";

interface InvoiceFormData {
  customerId: string;
  customerName: string;
  eventDetails: string;
  amountBreakdown: string;
  totalAmount: string;
}

interface InvoiceGeneratorProps {
  customers: Customer[];
  invoices: Invoice[];
  invoiceForm: InvoiceFormData;
  onFormChange: (form: InvoiceFormData) => void;
  onGeneratePDF: () => void;
}

function formatMoney(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

export default function InvoiceGenerator({
  customers,
  invoices,
  invoiceForm,
  onFormChange,
  onGeneratePDF,
}: InvoiceGeneratorProps) {
  const selectedCustomer = customers.find((row) => row._id === invoiceForm.customerId);
  const displayName = selectedCustomer?.name || invoiceForm.customerName || "-";

  return (
    <section className="panel">
      <h2>Invoice Generator</h2>
      <div className="invoice-grid">
        <label htmlFor="i-customer">
          Customer Name
          <select
            id="i-customer"
            value={invoiceForm.customerId}
            onChange={(event) =>
              onFormChange({ ...invoiceForm, customerId: event.target.value })
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
        <label htmlFor="i-custom-name">
          Or Customer Name
          <input
            id="i-custom-name"
            type="text"
            value={invoiceForm.customerName}
            onChange={(event) =>
              onFormChange({ ...invoiceForm, customerName: event.target.value })
            }
          />
        </label>
        <label htmlFor="i-details">
          Event Details
          <input
            id="i-details"
            type="text"
            value={invoiceForm.eventDetails}
            onChange={(event) =>
              onFormChange({ ...invoiceForm, eventDetails: event.target.value })
            }
          />
        </label>
        <label htmlFor="i-total">
          Total Amount
          <input
            id="i-total"
            type="number"
            value={invoiceForm.totalAmount}
            onChange={(event) =>
              onFormChange({ ...invoiceForm, totalAmount: event.target.value })
            }
          />
        </label>
        <label htmlFor="i-breakdown">
          Amount Breakdown
          <textarea
            id="i-breakdown"
            rows={4}
            value={invoiceForm.amountBreakdown}
            onChange={(event) =>
              onFormChange({ ...invoiceForm, amountBreakdown: event.target.value })
            }
          />
        </label>

        <article className="invoice-preview">
          <h3>Invoice Preview</h3>
          <p>Client: {displayName}</p>
          <p>Event: {invoiceForm.eventDetails || "-"}</p>
          <p>Total: {formatMoney(Number(invoiceForm.totalAmount || 0))}</p>
          <button type="button" className="action-btn" onClick={onGeneratePDF}>
            Download PDF
          </button>
        </article>
      </div>

      <div className="table-wrap" style={{ marginTop: 12 }}>
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Event</th>
              <th>Total</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((row) => (
              <tr key={row._id}>
                <td>{row.customerName}</td>
                <td>{row.eventDetails}</td>
                <td>{formatMoney(row.totalAmount)}</td>
                <td>{row.createdAt ? new Date(row.createdAt).toLocaleDateString("en-IN") : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}