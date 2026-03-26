"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import TopNav from "@/components/TopNav";
import LeftSidebar from "@/components/LeftSidebar";
import StatusNotice from "@/components/StatusNotice";
import Dashboard from "@/components/Dashboard";
import CustomerManagement from "@/components/CustomerManagement";
import BookingManagement from "@/components/BookingManagement";
import PaymentTracking from "@/components/PaymentTracking";
import ReminderSystem from "@/components/ReminderSystem";
import AdminPanel from "@/components/AdminPanel";
import FoodManagement from "@/components/FoodManagement";
import InvoiceGenerator from "@/components/InvoiceGenerator";
import { Booking, Customer, FoodPlan, Invoice, Payment, Reminder } from "@/lib/types";

const halls = ["Emerald Hall", "Royal Ballroom", "Garden Pavilion"];
const eventTypes = ["Wedding", "Corporate", "Engagement", "Birthday", "Other"];

interface CrmDashboardProps {
  initialSection?: string;
}

function formatMoney(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function CrmDashboard({ initialSection }: CrmDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("Loading real-time data from database...");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [foodPlans, setFoodPlans] = useState<FoodPlan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [search, setSearch] = useState("");

  const [customerForm, setCustomerForm] = useState({ name: "", phone: "", email: "" });
  const [customerEditId, setCustomerEditId] = useState<string | null>(null);

  const [bookingForm, setBookingForm] = useState({
    customerId: "",
    customerName: "",
    eventDate: "",
    eventType: "Wedding",
    guests: "150",
    hall: halls[0],
    status: "Pending" as "Confirmed" | "Pending",
  });

  const [paymentForm, setPaymentForm] = useState({
    customerId: "",
    customerName: "",
    totalAmount: "",
    paidAmount: "",
    dueDate: "",
  });

  const [reminderForm, setReminderForm] = useState({
    type: "Event tomorrow" as "Event tomorrow" | "Payment due",
    message: "",
    dueDate: "",
  });

  const [foodForm, setFoodForm] = useState({
    customerName: "",
    menuType: "Veg" as "Veg" | "Non-Veg",
    guests: "150",
    eventDate: "",
  });

  const [invoiceForm, setInvoiceForm] = useState({
    customerId: "",
    customerName: "",
    eventDetails: "",
    amountBreakdown: "",
    totalAmount: "",
  });

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((row) => {
      return (
        row.name.toLowerCase().includes(term) ||
        row.phone.toLowerCase().includes(term) ||
        row.email.toLowerCase().includes(term)
      );
    });
  }, [customers, search]);

  const metrics = useMemo(() => {
    const today = todayISO();
    const todayBookings = bookings.filter((row) => row.eventDate === today).length;
    const upcomingEvents = bookings.filter((row) => row.eventDate >= today).length;
    const totalRevenue = payments.reduce((sum, row) => sum + row.paidAmount, 0);
    const pendingAmount = payments.reduce((sum, row) => sum + row.remainingAmount, 0);

    return { todayBookings, upcomingEvents, totalRevenue, pendingAmount };
  }, [bookings, payments]);

  const chartData = useMemo(() => {
    const revenueByMonth = new Map<string, number>();

    for (const row of payments) {
      const date = row.dueDate ? new Date(row.dueDate) : new Date();
      const month = date.toLocaleString("en-US", { month: "short" });
      revenueByMonth.set(month, (revenueByMonth.get(month) ?? 0) + row.paidAmount);
    }

    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date().getMonth();
    const start = now - 5 >= 0 ? now - 5 : 0;
    const last6 = monthOrder.slice(start, now + 1);
    const normalizedMonths = last6.length > 0 ? last6 : monthOrder.slice(0, 6);

    const values = normalizedMonths.map((month) => revenueByMonth.get(month) ?? 0);
    const maxValue = Math.max(...values, 1);

    const monthlyRevenue = normalizedMonths.map((month) => ({
      month,
      value: Math.round(((revenueByMonth.get(month) ?? 0) / maxValue) * 100),
    }));

    const eventTypeCounts = eventTypes.reduce<Record<string, number>>((acc, type) => {
      acc[type] = bookings.filter((row) => row.eventType === type).length;
      return acc;
    }, {});

    const totalEvents = Object.values(eventTypeCounts).reduce((sum, value) => sum + value, 0);

    const eventTypeLegend = eventTypes
      .map((type) => {
        const count = eventTypeCounts[type];
        const percentage = totalEvents === 0 ? 0 : Math.round((count / totalEvents) * 100);
        return `${type} ${percentage}%`;
      })
      .filter(Boolean);

    return { monthlyRevenue, eventTypeLegend };
  }, [payments, bookings]);

  const foodQuantity = useMemo(() => {
    const guests = Number(foodForm.guests || 0);
    if (!guests) return "";
    return `${guests} plates + ${Math.ceil(guests * 0.2)} backup`;
  }, [foodForm.guests]);

  async function fetchCollection<T>(url: string): Promise<T[]> {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login";
      }
      throw new Error(`Request failed for ${url}`);
    }
    return (await response.json()) as T[];
  }

  const hydrateAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [customerRows, bookingRows, paymentRows, reminderRows, foodRows, invoiceRows] = await Promise.all([
        fetchCollection<Customer>("/api/customers"),
        fetchCollection<Booking>("/api/bookings"),
        fetchCollection<Payment>("/api/payments"),
        fetchCollection<Reminder>("/api/reminders"),
        fetchCollection<FoodPlan>("/api/food-plans"),
        fetchCollection<Invoice>("/api/invoices"),
      ]);

      setCustomers(customerRows);
      setBookings(bookingRows);
      setPayments(paymentRows);
      setReminders(reminderRows);
      setFoodPlans(foodRows);
      setInvoices(invoiceRows);
      setNotice("All modules are now reading live data from MongoDB.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void hydrateAllData();
  }, [hydrateAllData]);

  useEffect(() => {
    if (!initialSection) return;
    const target = document.getElementById(initialSection);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [initialSection, loading]);

  async function createRecord<T>(url: string, payload: Record<string, unknown>): Promise<T> {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error ?? "Unable to save record");
    }

    return (await response.json()) as T;
  }

  async function deleteRecord(url: string) {
    const response = await fetch(url, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error ?? "Unable to delete record");
    }
  }

  async function handleSaveCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      name: customerForm.name.trim(),
      phone: customerForm.phone.trim(),
      email: customerForm.email.trim().toLowerCase(),
    };

    if (!payload.name || !payload.phone || !payload.email) {
      setNotice("Customer name, phone and email are required.");
      return;
    }

    try {
      if (customerEditId) {
        const response = await fetch(`/api/customers/${customerEditId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error ?? "Unable to update customer");
        }

        const updated = (await response.json()) as Customer;
        setCustomers((prev) => prev.map((row) => (row._id === customerEditId ? updated : row)));
        setNotice("Customer updated in database.");
      } else {
        const created = await createRecord<Customer>("/api/customers", payload);
        setCustomers((prev) => [created, ...prev]);
        setNotice("Customer saved in database.");
      }

      setCustomerEditId(null);
      setCustomerForm({ name: "", phone: "", email: "" });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to save customer");
    }
  }

  function handleEditCustomer(row: Customer) {
    setCustomerEditId(row._id);
    setCustomerForm({ name: row.name, phone: row.phone, email: row.email });
  }

  async function handleDeleteCustomer(id: string) {
    try {
      await deleteRecord(`/api/customers/${id}`);
      setCustomers((prev) => prev.filter((row) => row._id !== id));
      setNotice("Customer deleted from database.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Delete failed");
    }
  }

  async function handleSaveBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const selectedCustomer = customers.find((row) => row._id === bookingForm.customerId);
    const customerName = selectedCustomer?.name || bookingForm.customerName.trim();

    const payload = {
      customerId: bookingForm.customerId,
      customerName,
      eventDate: bookingForm.eventDate,
      eventType: bookingForm.eventType,
      guests: Number(bookingForm.guests || 0),
      hall: bookingForm.hall,
      status: bookingForm.status,
    };

    if (!payload.customerName || !payload.eventDate || payload.guests <= 0) {
      setNotice("Booking form is incomplete.");
      return;
    }

    try {
      const created = await createRecord<Booking>("/api/bookings", payload);
      setBookings((prev) => [...prev, created]);
      setNotice("Booking saved in database.");
      setBookingForm((prev) => ({ ...prev, customerName: "", eventDate: "", guests: "150" }));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to save booking");
    }
  }

  async function handleDeleteBooking(id: string) {
    try {
      await deleteRecord(`/api/bookings/${id}`);
      setBookings((prev) => prev.filter((row) => row._id !== id));
      setNotice("Booking deleted from database.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to delete booking");
    }
  }

  async function handleSavePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const selectedCustomer = customers.find((row) => row._id === paymentForm.customerId);
    const customerName = selectedCustomer?.name || paymentForm.customerName.trim();

    const payload = {
      customerId: paymentForm.customerId,
      customerName,
      totalAmount: Number(paymentForm.totalAmount || 0),
      paidAmount: Number(paymentForm.paidAmount || 0),
      dueDate: paymentForm.dueDate,
    };

    if (!payload.customerName || payload.totalAmount < 0 || payload.paidAmount < 0) {
      setNotice("Payment form is incomplete.");
      return;
    }

    try {
      const created = await createRecord<Payment>("/api/payments", payload);
      setPayments((prev) => [created, ...prev]);
      setNotice("Payment saved in database.");
      setPaymentForm({ customerId: "", customerName: "", totalAmount: "", paidAmount: "", dueDate: "" });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to save payment");
    }
  }

  async function handleDeletePayment(id: string) {
    try {
      await deleteRecord(`/api/payments/${id}`);
      setPayments((prev) => prev.filter((row) => row._id !== id));
      setNotice("Payment deleted from database.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to delete payment");
    }
  }

  async function handleSaveReminder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!reminderForm.message.trim()) {
      setNotice("Reminder message is required.");
      return;
    }

    try {
      const created = await createRecord<Reminder>("/api/reminders", {
        type: reminderForm.type,
        message: reminderForm.message.trim(),
        dueDate: reminderForm.dueDate,
      });
      setReminders((prev) => [created, ...prev]);
      setReminderForm((prev) => ({ ...prev, message: "", dueDate: "" }));
      setNotice("Reminder saved in database.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to save reminder");
    }
  }

  async function handleDeleteReminder(id: string) {
    try {
      await deleteRecord(`/api/reminders/${id}`);
      setReminders((prev) => prev.filter((row) => row._id !== id));
      setNotice("Reminder deleted from database.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to delete reminder");
    }
  }

  async function handleSaveFoodPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const guests = Number(foodForm.guests || 0);
    if (guests <= 0 || !foodQuantity) {
      setNotice("Food plan form is incomplete.");
      return;
    }

    try {
      const created = await createRecord<FoodPlan>("/api/food-plans", {
        customerName: foodForm.customerName,
        menuType: foodForm.menuType,
        guests,
        foodQuantity,
        eventDate: foodForm.eventDate,
      });
      setFoodPlans((prev) => [created, ...prev]);
      setNotice("Food plan saved in database.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to save food plan");
    }
  }

  async function handleDeleteFoodPlan(id: string) {
    try {
      await deleteRecord(`/api/food-plans/${id}`);
      setFoodPlans((prev) => prev.filter((row) => row._id !== id));
      setNotice("Food plan deleted from database.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to delete food plan");
    }
  }

  async function handleGenerateInvoicePDF() {
    const selectedCustomer = customers.find((row) => row._id === invoiceForm.customerId);
    const customerName = selectedCustomer?.name || invoiceForm.customerName.trim();
    const totalAmount = Number(invoiceForm.totalAmount || 0);

    if (!customerName || !invoiceForm.eventDetails.trim() || !invoiceForm.amountBreakdown.trim() || totalAmount < 0) {
      setNotice("Invoice form is incomplete.");
      return;
    }

    try {
      const saved = await createRecord<Invoice>("/api/invoices", {
        customerId: invoiceForm.customerId,
        customerName,
        eventDetails: invoiceForm.eventDetails.trim(),
        amountBreakdown: invoiceForm.amountBreakdown.trim(),
        totalAmount,
      });

      setInvoices((prev) => [saved, ...prev]);

      const pdf = new jsPDF();
      const breakdownLines = invoiceForm.amountBreakdown
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      pdf.setFontSize(18);
      pdf.text("The Great Callina Banquet Hall", 15, 20);
      pdf.setFontSize(12);
      pdf.text("Invoice", 15, 30);
      pdf.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, 15, 38);
      pdf.text(`Customer: ${customerName}`, 15, 46);
      pdf.text(`Event: ${invoiceForm.eventDetails.trim()}`, 15, 54);

      pdf.text("Amount Breakdown:", 15, 66);
      let y = 74;
      for (const line of breakdownLines) {
        pdf.text(`- ${line}`, 18, y);
        y += 8;
      }

      pdf.setFontSize(13);
      pdf.text(`Total Amount: ${formatMoney(totalAmount)}`, 15, y + 6);
      pdf.setFontSize(10);
      pdf.text("Generated by Admin CRM", 15, y + 18);

      const filename = `invoice-${customerName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.pdf`;
      pdf.save(filename);

      setNotice("Invoice saved to database and PDF downloaded.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to generate invoice");
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    window.location.href = "/login";
  }

  return (
    <div className="crm-app-shell">
      <TopNav search={search} onSearchChange={setSearch} onLogout={() => void handleLogout()} logo="/logo-thegreat.png" />

      <div className="app-body">
        <LeftSidebar />

        <main className="dashboard-content" data-view={initialSection ?? "all"}>
          <StatusNotice loading={loading} notice={notice} />

          <Dashboard metrics={metrics} chartData={chartData} />

          <CustomerManagement
            customers={customers}
            filteredCustomers={filteredCustomers}
            customerForm={customerForm}
            customerEditId={customerEditId}
            onFormChange={setCustomerForm}
            onSave={(event) => void handleSaveCustomer(event)}
            onEdit={handleEditCustomer}
            onDelete={(id) => void handleDeleteCustomer(id)}
            onAdd={() => {
              setCustomerEditId(null);
              setCustomerForm({ name: "", phone: "", email: "" });
            }}
          />

          <BookingManagement
            customers={customers}
            bookings={bookings}
            bookingForm={bookingForm}
            onFormChange={setBookingForm}
            onSave={(event) => void handleSaveBooking(event)}
            onDelete={(id) => void handleDeleteBooking(id)}
          />

          <PaymentTracking
            customers={customers}
            payments={payments}
            paymentForm={paymentForm}
            onFormChange={setPaymentForm}
            onSave={(event) => void handleSavePayment(event)}
            onDelete={(id) => void handleDeletePayment(id)}
          />

          <section id="reminders">
            <ReminderSystem
              reminders={reminders}
              reminderForm={reminderForm}
              onFormChange={setReminderForm}
              onSave={(event) => void handleSaveReminder(event)}
              onDelete={(id) => void handleDeleteReminder(id)}
            />
          </section>

          <section id="admin-panel">
            <AdminPanel />
          </section>

          <FoodManagement
            foodPlans={foodPlans}
            foodForm={foodForm}
            foodQuantity={foodQuantity}
            onFormChange={setFoodForm}
            onSave={(event) => void handleSaveFoodPlan(event)}
            onDelete={(id) => void handleDeleteFoodPlan(id)}
          />

          <section id="invoices">
            <InvoiceGenerator
              customers={customers}
              invoices={invoices}
              invoiceForm={invoiceForm}
              onFormChange={setInvoiceForm}
              onGeneratePDF={() => void handleGenerateInvoicePDF()}
            />
          </section>
        </main>
      </div>
    </div>
  );
}