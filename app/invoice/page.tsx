import type { Metadata } from "next";
import { headers } from "next/headers";
import InvoiceGenerator from "@/components/invoice-generator";
import { getContent } from "@/lib/admin";

export const dynamic = "force-dynamic";
const faqs = [
  {
    question: "Is this invoice generator free?",
    answer: "Yes. Create and download invoice PDFs for free without creating an account.",
  },
  {
    question: "Is my invoice information uploaded?",
    answer: "No. The invoice preview and PDF are generated in your browser. Details are not sent to our server or saved by this tool.",
  },
  {
    question: "Can I create a GST invoice with this tool?",
    answer: "You can enter a tax rate and the tool will calculate it. It does not verify GST registration, determine the correct tax rate, or ensure statutory invoice compliance. Confirm those details before issuing an invoice.",
  },
  {
    question: "Can I download and print the invoice?",
    answer: "Yes. Select Download invoice PDF to save a print-ready file. Invoices with many line items continue onto another page.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  const title = content.seo.invoice?.title || "Free Invoice Generator for India | PaperMint";
  const description = content.seo.invoice?.description || "Create and download a professional invoice PDF with line items, tax and totals. Free, private and no signup needed.";
  const siteUrl = process.env.SITE_URL;
  return {
    title,
    description,
    alternates: siteUrl ? { canonical: new URL("/invoice", siteUrl).toString() } : undefined,
    openGraph: {
      type: "website",
      title,
      description,
      url: siteUrl ? new URL("/invoice", siteUrl).toString() : undefined,
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function InvoicePage() {
  const nonce = (await headers()).get("x-nonce") || undefined;
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
  return (
    <div className="container invoice-page">
      <div className="invoice-page-heading">
        <div><span className="accent eyebrow">PAPERMINT / INVOICE</span><h1>Free Invoice Generator</h1><p className="muted">Create a professional invoice PDF in seconds. Free, private, and no signup needed.</p></div>
        <div className="invoice-heading-badge"><span>✦</span><div><strong>Made for India</strong><small>Amounts in Indian rupees</small></div></div>
      </div>
      <InvoiceGenerator />
      <section className="invoice-seo prose">
        <h2>A professional invoice, without the busywork</h2>
        <p>Add your business and customer details, list products or services, set a tax rate and due date, then review the live preview. Download a print-ready PDF when everything looks right. Your invoice is generated on this device.</p>
        <h2>How to create an invoice</h2>
        <ol><li>Enter the business and customer details.</li><li>Add line items, quantities and rates.</li><li>Review the subtotal, discount, tax and total.</li><li>Download the PDF and share it with your customer.</li></ol>
        <h2>Tax note</h2>
        <p>This tool calculates the tax percentage you enter. It does not determine your GST registration status, applicable tax rate, invoice compliance, or filing obligations. Confirm invoice requirements with a qualified tax professional before issuing invoices.</p>
        <h2>Free online invoice maker FAQs</h2>
        {faqs.map(({ question, answer }) => (
          <details key={question} style={{ padding: "14px 0", borderBottom: "1px solid var(--line)" }}>
            <summary style={{ fontWeight: 700, cursor: "pointer" }}>{question}</summary>
            <p style={{ marginBottom: 0 }}>{answer}</p>
          </details>
        ))}
      </section>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}
