import { createClient } from "@supabase/supabase-js";
export type Content = {
  headline: string;
  subheadline: string;
  banner: string;
  faqs: { q: string; a: string }[];
  seo: Record<string, { title: string; description: string }>;
};
export const defaultContent: Content = {
  headline: "Invoices and rent receipts, made simple.",
  subheadline:
    "Create a polished invoice or prepare HRA rent receipts in your browser. Private by design, free to use, and ready when you need it.",
  banner: "",
  faqs: [
    {
      q: "Is this rent receipt generator free?",
      a: "Yes. You can create and download receipts without an account or fee.",
    },
    {
      q: "Is my rent information uploaded?",
      a: "No. Receipt details stay in this browser tab; the PDF is created on your device.",
    },
    {
      q: "Do I need my landlord's PAN?",
      a: "It is generally required for HRA documentation when annual rent paid exceeds ₹1,00,000. Confirm your employer's current documentation rules.",
    },
    {
      q: "Does a receipt guarantee an HRA exemption?",
      a: "No. A receipt is supporting evidence only. Eligibility depends on your circumstances and the applicable tax regime.",
    },
    {
      q: "Can I create receipts for a full year?",
      a: "Yes. Choose a start and end month up to 12 months apart and download one PDF.",
    },
  ],
  seo: {
    home: {
      title: "Free Invoice & Rent Receipt Tools for India",
      description:
        "Create polished invoices and HRA rent receipts in your browser. Free, private, and no signup required.",
    },
    generator: {
      title: "Generate rent receipts online",
      description: "Generate private rent receipts for HRA records in one PDF. No signup required.",
    },
    invoice: {
      title: "Free Invoice Generator for India",
      description: "Create a polished invoice PDF in your browser with line items, tax, dates and customer details.",
    },
    about: {
      title: "About PaperMint",
      description:
        "Why we built PaperMint: a simple, private way to prepare everyday paperwork in your browser.",
    },
    privacy: {
      title: "Privacy Policy",
      description:
        "Learn how PaperMint protects your privacy when you create invoices and rent receipts.",
    },
    terms: {
      title: "Terms of Use",
      description: "Terms for using PaperMint's free invoice and rent receipt tools.",
    },
    contact: {
      title: "Contact PaperMint",
      description:
        "Contact the PaperMint site operator with a question or issue.",
    },
  },
};
export async function seoFor(page: string) {
  return (await getContent()).seo[page];
}
export function db() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    throw new Error("Admin content store is not configured");
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
export async function getContent(): Promise<Content> {
  try {
    const { data, error } = await db()
      .from("site_content")
      .select("content")
      .eq("id", "main")
      .maybeSingle();
    if (error || !data?.content) return defaultContent;
    return {
      ...defaultContent,
      ...data.content,
      seo: { ...defaultContent.seo, ...(data.content.seo ?? {}) },
    };
  } catch {
    return defaultContent;
  }
}
export function safeContent(raw: unknown): Content {
  if (!raw || typeof raw !== "object") throw new Error("Invalid content");
  const x = raw as Record<string, unknown>;
  const clean = (v: unknown, max: number) => {
    if (typeof v !== "string" || v.length > max)
      throw new Error("Invalid content");
    return v.replace(/[<>\u0000-\u001f\u007f]/g, "").trim();
  };
  if (
    !Array.isArray(x.faqs) ||
    x.faqs.length > 12 ||
    !x.seo ||
    typeof x.seo !== "object"
  )
    throw new Error("Invalid content");
  const faqs = x.faqs.map((f) => {
    if (!f || typeof f !== "object") throw new Error("Invalid FAQ");
    const o = f as Record<string, unknown>;
    return { q: clean(o.q, 180), a: clean(o.a, 600) };
  });
  const seo: Content["seo"] = {};
  for (const [k, val] of Object.entries(x.seo as Record<string, unknown>)) {
    if (!val || typeof val !== "object") throw new Error("Invalid SEO");
    const o = val as Record<string, unknown>;
    seo[k] = {
      title: clean(o.title, 70),
      description: clean(o.description, 170),
    };
  }
  return {
    headline: clean(x.headline, 120),
    subheadline: clean(x.subheadline, 300),
    banner: clean(x.banner, 180),
    faqs,
    seo,
  };
}
