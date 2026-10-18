import type { Metadata } from "next";
import { getContent } from "@/lib/admin";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return {
    title: c.seo.about?.title || "About PaperMint",
    description:
      c.seo.about?.description ||
      "Why we built PaperMint: a simple, private way to prepare everyday paperwork in your browser.",
  };
}
export default function Page() {
  return (
    <article
      className="container prose"
      style={{ maxWidth: 780, padding: "58px 0" }}
    >
      <h1>About PaperMint</h1>
      <p>
        PaperMint is a small browser-based toolkit for preparing invoices and
        rent receipt PDFs. We built it to make routine paperwork quick,
        legible and private.
      </p>
      <h2>Private by design</h2>
      <p>
        The receipt form and PDF generation run in your browser. We do not
        collect, retain or transmit the rent details you enter. The optional
        admin area is separate and only stores site copy when an operator
        configures a content database.
      </p>
      <h2>Use receipts responsibly</h2>
      <p>
        PaperMint creates document templates. Make sure each receipt reflects a
        rent payment that actually occurred, and confirm your invoice and tax
        details with a qualified adviser when needed.
      </p>
    </article>
  );
}
