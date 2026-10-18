"use client";

import { useMemo, useState } from "react";
import { invoiceSchema, type InvoiceInput } from "@/lib/invoice-schema";

const today = new Date().toISOString().slice(0, 10);
const initial: InvoiceInput = {
  business: "Northstar Studio",
  email: "hello@northstar.in",
  address: "42, Indiranagar, Bengaluru, Karnataka 560038",
  customer: "Aarav Mehta",
  customerAddress: "Bengaluru, Karnataka",
  invoiceNumber: `INV-${new Date().getFullYear()}-001`,
  issueDate: today,
  dueDate: today,
  taxRate: 0,
  discount: 0,
  notes: "Thank you for your business.",
  items: [
    { description: "Brand design and direction", quantity: 1, rate: 18000 },
    { description: "Website design consultation", quantity: 4, rate: 2500 },
  ],
};
const money = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
const dateLabel = (value: string) => {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

export default function InvoiceGenerator() {
  const [form, setForm] = useState<InvoiceInput>(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const subtotal = useMemo(
    () => form.items.reduce((sum, item) => sum + item.quantity * item.rate, 0),
    [form.items],
  );
  const taxable = Math.max(0, subtotal - form.discount);
  const tax = taxable * form.taxRate / 100;
  const total = taxable + tax;

  const update = (key: keyof InvoiceInput, value: InvoiceInput[keyof InvoiceInput]) =>
    setForm((previous) => ({ ...previous, [key]: value } as InvoiceInput));
  const updateItem = (index: number, key: "description" | "quantity" | "rate", value: string) =>
    setForm((previous) => ({
      ...previous,
      items: previous.items.map((item, i) => {
        if (i !== index) return item;
        return {
          description: key === "description" ? value : item.description,
          quantity: key === "quantity" ? Number(value) : item.quantity,
          rate: key === "rate" ? Number(value) : item.rate,
        };
      }),
    }));

  async function downloadPdf() {
    setBusy(true);
    setError("");
    try {
      const parsed = invoiceSchema.safeParse(form);
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "Please review the invoice details.");
        return;
      }
      const data = parsed.data;
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const left = 18;
      const right = 192;
      const ink: [number, number, number] = [31, 48, 41];
      const muted: [number, number, number] = [111, 126, 117];
      const green: [number, number, number] = [8, 126, 98];
      const line: [number, number, number] = [224, 232, 226];
      const fmt = (n: number) => `Rs. ${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

      pdf.setFillColor(...green);
      pdf.rect(0, 0, 210, 8, "F");
      pdf.setTextColor(...ink);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.text(data.business, left, 28);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(...muted);
      pdf.text(data.address, left, 35, { maxWidth: 88 });
      if (data.email) pdf.text(data.email, left, 41);

      pdf.setTextColor(...green);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(27);
      pdf.text("INVOICE", right, 27, { align: "right" });
      pdf.setFontSize(10);
      pdf.setTextColor(...ink);
      pdf.text(data.invoiceNumber, right, 35, { align: "right" });

      pdf.setDrawColor(...line);
      pdf.line(left, 51, right, 51);
      pdf.setFontSize(8);
      pdf.setTextColor(...muted);
      pdf.text("BILL TO", left, 61);
      pdf.text("ISSUED", 137, 61);
      pdf.text("DUE DATE", right, 61, { align: "right" });
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(...ink);
      pdf.text(data.customer, left, 69);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(...muted);
      if (data.customerAddress) pdf.text(data.customerAddress, left, 75, { maxWidth: 92 });
      pdf.setTextColor(...ink);
      pdf.text(dateLabel(data.issueDate), 137, 69);
      pdf.text(dateLabel(data.dueDate), right, 69, { align: "right" });

      const tableTop = 91;
      pdf.setFillColor(241, 247, 243);
      pdf.roundedRect(left, tableTop, right - left, 12, 2, 2, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(...muted);
      pdf.text("DESCRIPTION", left + 4, tableTop + 8);
      pdf.text("QTY", 127, tableTop + 8, { align: "right" });
      pdf.text("RATE", 157, tableTop + 8, { align: "right" });
      pdf.text("AMOUNT", right - 4, tableTop + 8, { align: "right" });
      let y = tableTop + 21;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(...ink);
      data.items.forEach((item, index) => {
        if (index === 8) {
          pdf.addPage();
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(18);
          pdf.setTextColor(...ink);
          pdf.text("INVOICE CONTINUED", left, 27);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          pdf.setTextColor(...muted);
          pdf.text(data.invoiceNumber, right, 27, { align: "right" });
          pdf.setFillColor(241, 247, 243);
          pdf.roundedRect(left, 38, right - left, 12, 2, 2, "F");
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(8);
          pdf.setTextColor(...muted);
          pdf.text("DESCRIPTION", left + 4, 46);
          pdf.text("QTY", 127, 46, { align: "right" });
          pdf.text("RATE", 157, 46, { align: "right" });
          pdf.text("AMOUNT", right - 4, 46, { align: "right" });
          y = 59;
        }
        pdf.text(item.description, left + 4, y, { maxWidth: 82 });
        pdf.text(String(item.quantity), 127, y, { align: "right" });
        pdf.text(fmt(item.rate), 157, y, { align: "right" });
        pdf.text(fmt(item.quantity * item.rate), right - 4, y, { align: "right" });
        y += 12;
        pdf.setDrawColor(...line);
        pdf.line(left + 4, y - 5, right - 4, y - 5);
      });

      const totalTop = Math.max(y + 1, 140);
      pdf.setFontSize(9);
      pdf.setTextColor(...muted);
      pdf.text("Subtotal", 145, totalTop, { align: "right" });
      pdf.setTextColor(...ink);
      pdf.text(fmt(subtotal), right - 4, totalTop, { align: "right" });
      let sumY = totalTop + 8;
      if (data.discount > 0) {
        pdf.setTextColor(...muted);
        pdf.text("Discount", 145, sumY, { align: "right" });
        pdf.setTextColor(...ink);
        pdf.text(`- ${fmt(data.discount)}`, right - 4, sumY, { align: "right" });
        sumY += 8;
      }
      pdf.setTextColor(...muted);
      pdf.text(`Tax (${data.taxRate}%)`, 145, sumY, { align: "right" });
      pdf.setTextColor(...ink);
      pdf.text(fmt(tax), right - 4, sumY, { align: "right" });
      sumY += 10;
      pdf.setDrawColor(...line);
      pdf.line(126, sumY - 4, right, sumY - 4);
      pdf.setFillColor(235, 246, 239);
      pdf.roundedRect(123, sumY, 69, 18, 2, 2, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...green);
      pdf.setFontSize(10);
      pdf.text("TOTAL DUE", 128, sumY + 11);
      pdf.setFontSize(12);
      pdf.text(fmt(total), right - 4, sumY + 11, { align: "right" });

      const footerY = Math.min(Math.max(sumY + 34, 218), 255);
      if (data.notes) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(...ink);
        pdf.text("NOTES", left, footerY);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(...muted);
        pdf.text(data.notes, left, footerY + 7, { maxWidth: 110 });
      }
      pdf.setDrawColor(...line);
      pdf.line(left, 277, right, 277);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(...muted);
      pdf.text("Created with PaperMint · Your details stay on this device", 105, 284, { align: "center" });
      pdf.save(`${data.invoiceNumber.replace(/[^a-z0-9-_]/gi, "-")}.pdf`);
    } catch {
      setError("We couldn't create the PDF. Please try again in this browser.");
    } finally {
      setBusy(false);
    }
  }

  const field = (label: string, key: "business" | "email" | "address" | "customer" | "customerAddress" | "invoiceNumber" | "issueDate" | "dueDate" | "taxRate" | "discount" | "notes", type = "text", span = false) => (
    <div className={`field${span ? " span-2" : ""}`}>
      <label htmlFor={key}>{label}</label>
      <input id={key} className="control" type={type} value={String(form[key])}
        min={type === "number" ? 0 : undefined} max={type === "number" ? (key === "taxRate" ? 100 : 100000000) : undefined}
        onChange={(event) => update(key, type === "number" ? Number(event.target.value) : event.target.value)} />
    </div>
  );

  return (
    <div className="invoice-layout">
      <section className="surface invoice-form-card">
        <div className="invoice-form-heading">
          <div><span className="accent eyebrow">YOUR DOCUMENT</span><h2>Invoice details</h2></div>
          <span className="pill">Browser-only · No account</span>
        </div>
        <form onSubmit={(event) => { event.preventDefault(); void downloadPdf(); }}>
          <fieldset className="invoice-fieldset">
            <legend><span>01</span> From your business</legend>
            <div className="grid-form">
              {field("Business or your name", "business")}
              {field("Email address (optional)", "email", "email")}
              {field("Business address", "address", "text", true)}
            </div>
          </fieldset>
          <fieldset className="invoice-fieldset">
            <legend><span>02</span> Bill to</legend>
            <div className="grid-form">
              {field("Customer name", "customer")}
              {field("Customer address (optional)", "customerAddress")}
            </div>
          </fieldset>
          <fieldset className="invoice-fieldset">
            <legend><span>03</span> Invoice and dates</legend>
            <div className="grid-form">
              {field("Invoice number", "invoiceNumber")}
              {field("Issue date", "issueDate", "date")}
              {field("Due date", "dueDate", "date")}
            </div>
          </fieldset>
          <fieldset className="invoice-fieldset">
            <legend><span>04</span> Items and pricing <small>Up to 12 line items</small></legend>
            <div className="invoice-items-editor">
              <div className="invoice-item-labels"><span>Description</span><span>Qty</span><span>Rate · ₹</span><span /></div>
              {form.items.map((item, index) => (
                <div className="invoice-item-row" key={index}>
                  <input className="control" aria-label={`Item ${index + 1} description`} value={item.description} maxLength={120} placeholder="Service or product" onChange={(e) => updateItem(index, "description", e.target.value)} />
                  <input className="control" aria-label={`Item ${index + 1} quantity`} type="number" min="0.01" step="0.01" value={item.quantity} onChange={(e) => updateItem(index, "quantity", e.target.value)} />
                  <input className="control" aria-label={`Item ${index + 1} rate`} type="number" min="0" step="0.01" value={item.rate} onChange={(e) => updateItem(index, "rate", e.target.value)} />
                  <button type="button" className="icon-button" aria-label={`Remove item ${index + 1}`} disabled={form.items.length === 1} onClick={() => update("items", form.items.filter((_, i) => i !== index))}>×</button>
                </div>
              ))}
              <button type="button" className="add-item" disabled={form.items.length >= 12} onClick={() => update("items", [...form.items, { description: "", quantity: 1, rate: 0 }])}>＋ Add line item</button>
            </div>
            <div className="grid-form invoice-adjustments">
              {field("Tax / GST rate (%)", "taxRate", "number")}
              {field("Discount (₹)", "discount", "number")}
              {field("Notes or payment details", "notes", "text", true)}
            </div>
            <p className="muted invoice-tax-hint">Tax is added to the subtotal after discount. Enter a rate only when it applies to your sale.</p>
          </fieldset>
          <button className="btn invoice-download" type="submit" disabled={busy}>{busy ? "Preparing your PDF…" : <><span aria-hidden>↓</span> Download invoice PDF</>}</button>
          {error && <p role="alert" className="invoice-error">{error}</p>}
          <p className="muted invoice-privacy">Made for straightforward billing. Please confirm your tax details are right before sending.</p>
        </form>
      </section>

      <aside className="invoice-preview-column">
        <div className="invoice-preview-toolbar"><div><span className="eyebrow accent">LIVE PREVIEW</span><h2>Your invoice</h2></div><span className="preview-live"><i /> Updates live</span></div>
        <article className="invoice-paper" aria-label="Live invoice preview">
        <div className="invoice-paper-top"><div><div className="invoice-brand-mark">{form.business.trim().slice(0, 1).toUpperCase() || "P"}</div><h3>{form.business || "Your business"}</h3><p>{form.address || "Your business address"}</p>{form.email && <p>{form.email}</p>}</div><div className="invoice-title"><span>INVOICE</span><strong>{form.invoiceNumber || "INV-0001"}</strong></div></div>
          <div className="invoice-paper-rule" />
          <div className="invoice-meta"><div><span>BILL TO</span><strong>{form.customer || "Customer name"}</strong><p>{form.customerAddress || "Customer address"}</p></div><div><span>ISSUED</span><strong>{dateLabel(form.issueDate)}</strong></div><div><span>DUE DATE</span><strong>{dateLabel(form.dueDate)}</strong></div></div>
          <div className="invoice-preview-table"><div className="invoice-preview-head"><span>DESCRIPTION</span><span>QTY</span><span>RATE</span><span>AMOUNT</span></div>{form.items.map((item, index) => <div className="invoice-preview-row" key={index}><span>{item.description || "Item description"}</span><span>{item.quantity || 0}</span><span>{money(item.rate || 0)}</span><strong>{money((item.quantity || 0) * (item.rate || 0))}</strong></div>)}</div>
          <div className="invoice-preview-summary"><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>{form.discount > 0 && <div><span>Discount</span><strong>− {money(form.discount)}</strong></div>}<div><span>Tax ({form.taxRate || 0}%)</span><strong>{money(tax)}</strong></div><div className="invoice-total"><span>Total due</span><strong>{money(total)}</strong></div></div>
          {form.notes && <div className="invoice-paper-notes"><span>NOTE</span><p>{form.notes}</p></div>}
          <div className="invoice-paper-footer"><span>Thank you for your business</span><span>Made with PaperMint</span></div>
        </article>
        <div className="invoice-summary-card"><span className="muted">Total to collect</span><strong>{money(total)}</strong><small>Tax included · calculated from your line items</small></div>
        <p className="muted invoice-preview-note"><span aria-hidden>🔒</span> Your invoice details stay in this browser. Nothing is uploaded.</p>
      </aside>
    </div>
  );
}
