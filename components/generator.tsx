"use client";
import { useMemo, useState } from "react";
import {
  receiptMonths,
  receiptSchema,
  type ReceiptInput,
} from "@/lib/receipt-schema";
const now = new Date();
const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
const initial: ReceiptInput = {
  tenant: "",
  landlord: "",
  pan: "",
  address: "",
  rent: 25000,
  start: current,
  end: current,
  mode: "UPI",
  stamp: false,
};
const monthName = (s: string) =>
  new Date(Number(s.slice(0, 4)), Number(s.slice(5)) - 1, 1).toLocaleDateString(
    "en-IN",
    { month: "long", year: "numeric" },
  );
export default function Generator() {
  const [v, setV] = useState<ReceiptInput>(initial),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const months = useMemo(() => {
    try {
      return receiptMonths(v.start, v.end);
    } catch {
      return [];
    }
  }, [v.start, v.end]);
  const update = (key: keyof ReceiptInput, value: unknown) =>
    setV((old) => ({ ...old, [key]: value }));
  async function download() {
    setBusy(true);
    setError("");
    try {
      const parsed = receiptSchema.safeParse(v);
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message || "Please check the fields.");
        return;
      }
      const data = parsed.data;
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const list = receiptMonths(data.start, data.end);
      list.forEach((m, i) => {
        if (i) pdf.addPage();
        pdf.setDrawColor(15, 126, 95);
        pdf.setLineWidth(0.7);
        pdf.roundedRect(20, 20, 170, 255, 3, 3);
        pdf.setTextColor(24, 45, 35);
        pdf.setFont("times", "bold");
        pdf.setFontSize(22);
        pdf.text("RENT RECEIPT", 105, 42, { align: "center" });
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        pdf.setTextColor(95, 110, 100);
        pdf.text(`Receipt for ${monthName(m)}`, 105, 51, { align: "center" });
        pdf.setDrawColor(220, 228, 222);
        pdf.line(34, 62, 176, 62);
        const rows = [
          ["Received from", data.tenant],
          [
            "The sum of",
            `Rs. ${data.rent.toLocaleString("en-IN")} (Rupees ${numberWords(data.rent)} only)`,
          ],
          ["Towards rent for", monthName(m)],
          ["Property address", data.address],
          ["Payment mode", data.mode],
          ["Landlord", data.landlord],
          ...(data.pan ? [["Landlord PAN", data.pan]] : []),
        ];
        let y = 78;
        rows.forEach(([label, value]) => {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          pdf.setTextColor(105, 118, 109);
          pdf.text(String(label).toUpperCase(), 35, y);
          pdf.setFontSize(12);
          pdf.setTextColor(32, 46, 37);
          const lines = pdf.splitTextToSize(String(value), 135);
          pdf.text(lines, 35, y + 7);
          y += Math.max(20, lines.length * 6 + 10);
        });
        if (data.stamp) {
          pdf.setDrawColor(130, 140, 132);
          pdf.setLineDashPattern([1, 1], 0);
          pdf.rect(146, 220, 27, 25);
          pdf.setLineDashPattern([], 0);
          pdf.setFontSize(7);
          pdf.text("REVENUE STAMP", 159.5, 234, { align: "center" });
        }
        pdf.setDrawColor(150, 165, 154);
        pdf.line(112, 244, 174, 244);
        pdf.setFontSize(10);
        pdf.text("Landlord's signature", 143, 251, { align: "center" });
        pdf.setFontSize(8);
        pdf.setTextColor(110, 120, 113);
        pdf.text(
          "This receipt records rent paid. Keep it with your supporting documents.",
          105,
          263,
          { align: "center" },
        );
      });
      pdf.save(`rent-receipts-${data.start}-to-${data.end}.pdf`);
    } catch {
      setError("We couldn't create the PDF. Please try again in this browser.");
    } finally {
      setBusy(false);
    }
  }
  const field = (
    label: string,
    key: keyof ReceiptInput,
    type = "text",
    hint?: string,
  ) => (
    <div className="field">
      <label htmlFor={key}>{label}</label>
      <input
        id={key}
        className="control"
        type={type}
        value={String(v[key])}
        onChange={(e) =>
          update(
            key,
            type === "number" ? Number(e.target.value) : e.target.value,
          )
        }
      />
      {hint && <small className="muted">{hint}</small>}
    </div>
  );
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1.05fr) minmax(320px,.95fr)",
        gap: 24,
        alignItems: "start",
      }}
      className="generator-layout"
    >
      <section className="surface" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 18, margin: "0 0 18px" }}>Receipt details</h2>
        <form
          className="grid-form"
          onSubmit={(e) => {
            e.preventDefault();
            void download();
          }}
        >
          {field("Tenant name", "tenant")}
          {field("Landlord name", "landlord")}
          {field(
            "Landlord PAN (optional)",
            "pan",
            "text",
            "Generally required when annual rent paid exceeds ₹1,00,000.",
          )}
          <div className="field">
            <label htmlFor="rent">Monthly rent (₹)</label>
            <input
              id="rent"
              className="control"
              type="number"
              min="1"
              max="10000000"
              value={v.rent}
              onChange={(e) => update("rent", Number(e.target.value))}
            />
          </div>
          <div className="field span-2">
            <label htmlFor="address">Rental property address</label>
            <textarea
              id="address"
              className="control"
              rows={2}
              value={v.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="start">Start month</label>
            <input
              id="start"
              className="control"
              type="month"
              value={v.start}
              onChange={(e) => update("start", e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="end">End month</label>
            <input
              id="end"
              className="control"
              type="month"
              value={v.end}
              onChange={(e) => update("end", e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="mode">Payment mode</label>
            <select
              id="mode"
              className="control"
              value={v.mode}
              onChange={(e) => update("mode", e.target.value)}
            >
              {["Cash", "Bank transfer", "UPI", "Cheque", "Other"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              alignSelf: "end",
              minHeight: 45,
            }}
          >
            <input
              type="checkbox"
              checked={v.stamp}
              onChange={(e) => update("stamp", e.target.checked)}
            />{" "}
            Show revenue stamp area
          </label>
          <div
            className="span-2"
            style={{ display: "grid", gap: 10, marginTop: 4 }}
          >
            <button className="btn" type="submit" disabled={busy}>
              {busy
                ? "Preparing PDF…"
                : "Download PDF · " +
                  Math.max(1, months.length) +
                  " page" +
                  (months.length === 1 ? "" : "s")}
            </button>
            {error && (
              <p role="alert" style={{ margin: 0, color: "#bd3030" }}>
                {error}
              </p>
            )}
            <small className="muted">
              Review details before downloading. This is a record template, not
              tax or legal advice.
            </small>
          </div>
        </form>
      </section>
      <aside>
        <div className="receipt-preview">
          <h3>RENT RECEIPT</h3>
          <div style={{ textAlign: "center", fontSize: 13, color: "#6b776e" }}>
            For {monthName(v.start)}
          </div>
          <div className="receipt-line">
            Received with thanks from{" "}
            <strong>{v.tenant || "Tenant name"}</strong>
          </div>
          <div className="receipt-line">
            A sum of{" "}
            <strong>₹{Number(v.rent || 0).toLocaleString("en-IN")}</strong>{" "}
            towards rent
          </div>
          <div className="receipt-line">
            For the property at{" "}
            <strong>{v.address || "Rental property address"}</strong>
          </div>
          <div className="receipt-line">
            Payment made via <strong>{v.mode}</strong>
          </div>
          <div className="receipt-footer">
            <span>Date: {new Date().toLocaleDateString("en-IN")}</span>
            <span
              style={{
                textAlign: "center",
                borderTop: "1px solid #85948a",
                paddingTop: 8,
                minWidth: 120,
              }}
            >
              Landlord signature
            </span>
          </div>
          {v.stamp && (
            <div
              style={{
                border: "1px dashed #94a198",
                width: 100,
                height: 58,
                display: "grid",
                placeItems: "center",
                fontSize: 10,
                marginTop: 24,
              }}
            >
              REVENUE STAMP
            </div>
          )}
        </div>
        <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>
          Preview shows the first month. Your PDF contains{" "}
          {Math.max(1, months.length)} receipt{months.length === 1 ? "" : "s"},
          one per page.
        </p>
      </aside>
      <style jsx>{`
        @media (max-width: 760px) {
          .generator-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
function numberWords(n: number) {
  if (n > 999999) return n.toLocaleString("en-IN");
  const a = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ],
    b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
  function part(x: number): string {
    if (x < 20) return a[x];
    if (x < 100) return b[Math.floor(x / 10)] + (x % 10 ? " " + a[x % 10] : "");
    return (
      a[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " " + part(x % 100) : "")
    );
  }
  return (
    part(Math.floor(n / 100000)) +
    " Lakh " +
    part(Math.floor(n / 1000) % 100) +
    " Thousand " +
    part(Math.floor(n / 100) % 10) +
    " Hundred " +
    part(n % 100)
  );
}
