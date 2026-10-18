import Link from "next/link";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { getContent } from "@/lib/admin";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return {
    title: c.seo.home?.title || "Free Invoice & Rent Receipt Tools for India",
    description:
      c.seo.home?.description ||
      "Create polished invoices and HRA rent receipts in your browser. Free, private, and no signup required.",
  };
}
export default async function Home() {
  const nonce = (await headers()).get("x-nonce") || undefined;
  const c = await getContent();
  const questions = c.faqs.map((f) => [f.q, f.a] as [string, string]);
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
  return (
    <>
      {c.banner && (
        <div
          style={{
            background: "var(--soft)",
            textAlign: "center",
            padding: 10,
          }}
        >
          {c.banner}
        </div>
      )}
      <section
        className="container home-hero"
      >
        <span className="pill"><span className="hero-sparkle">✦</span> Simple paperwork, made in India</span>
        <h1
          style={{
            fontSize: "clamp(2.5rem,7vw,4.7rem)",
            lineHeight: 1.05,
            letterSpacing: "-3px",
            maxWidth: 850,
            margin: "24px auto 18px",
          }}
        >
          {c.headline}
        </h1>
        <p
          className="muted"
          style={{
            fontSize: 19,
            maxWidth: 610,
            lineHeight: 1.65,
            margin: "0 auto 28px",
          }}
        >
          {c.subheadline}
        </p>
        <div className="hero-actions">
          <Link className="btn" href="/invoice">Create an invoice <span aria-hidden>→</span></Link>
          <Link className="btn btn-secondary" href="/generator">Make a rent receipt</Link>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 10,
            flexWrap: "wrap",
            marginTop: 32,
          }}
        >
          {[
            "✓ Free to use",
            "⌁ Your data stays on your device",
            "✓ No signup needed",
          ].map((x) => (
            <span className="pill" key={x}>
              {x}
            </span>
          ))}
        </div>
      </section>
      <section className="container" style={{ paddingBottom: 45 }}>
        <div className="tool-cards surface"
          style={{
            padding: "28px",
          }}
        >
          <article className="tool-card invoice-tool-card">
            <div className="tool-icon invoice-tool-icon">↗</div><span className="tool-kicker">FOR YOUR WORK</span>
            <h2>Invoice generator</h2><p className="muted">Build a clean, itemized invoice with tax, totals and a ready-to-send PDF.</p>
            <Link href="/invoice" className="tool-link">Create an invoice <span aria-hidden>→</span></Link>
          </article>
          <article className="tool-card receipt-tool-card">
            <div className="tool-icon receipt-tool-icon">⌂</div><span className="tool-kicker">FOR YOUR HRA</span>
            <h2>Rent receipt generator</h2><p className="muted">Prepare up to 12 monthly rent receipts in one tidy PDF for your records.</p>
            <Link href="/generator" className="tool-link">Generate receipts <span aria-hidden>→</span></Link>
          </article>
        </div>
      </section>
      <section
        className="container prose"
        style={{ padding: "32px 0 24px", maxWidth: 800 }}
      >
        <h2>Rent receipts for HRA records</h2>
        <p>
          PaperMint keeps everyday paperwork simple. Create invoices with itemized charges, or prepare rent receipts for the rent you report. Both tools generate the PDF locally in your browser; details are not submitted to our server.
        </p>
        <h2>How HRA documentation works</h2>
        <p>
          For salaried taxpayers, HRA exemption under section 10(13A) is
          generally calculated using the least of the applicable limits,
          including actual HRA, rent paid less 10% of salary, and a city-based
          salary percentage. Rules and tax-regime eligibility matter; a receipt
          alone does not establish an exemption. Refer to current Income Tax
          Department guidance and your employer before claiming.
        </p>
        <p>
          For rent paid above ₹1,00,000 in a financial year, the landlord&apos;s
          PAN is generally requested for HRA evidence. Ask your employer about
          current requirements.{" "}
          <a
            href="https://www.incometax.gov.in/iec/foportal/help/new-tax-vs-old-tax-regime-faqs"
            rel="noopener noreferrer"
            className="accent"
          >
            See Income Tax Department guidance
          </a>
          .
        </p>
        <h2>Frequently asked questions</h2>
        {questions.map(([q, a]) => (
          <details
            key={q}
            style={{ padding: "14px 0", borderBottom: "1px solid var(--line)" }}
          >
            <summary style={{ fontWeight: 700, cursor: "pointer" }}>
              {q}
            </summary>
            <p style={{ marginBottom: 0 }}>{a}</p>
          </details>
        ))}
      </section>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
