import type { Metadata } from "next";
import Generator from "@/components/generator";
import { getContent } from "@/lib/admin";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return {
    title: c.seo.generator?.title || "Generate rent receipts online",
    description:
      c.seo.generator?.description ||
      "Generate private rent receipts for HRA records in one PDF. No signup; your details stay in your browser.",
  };
}
export default function Page() {
  return (
    <div className="container" style={{ padding: "44px 0 60px" }}>
      <div style={{ marginBottom: 26 }}>
        <span className="accent" style={{ fontWeight: 700 }}>
          PaperMint / Rent receipt
        </span>
        <h1
          style={{ fontSize: 34, letterSpacing: "-1px", margin: "10px 0 6px" }}
        >
          Create your rent receipts
        </h1>
        <p className="muted" style={{ margin: 0 }}>
          Your details stay on this device. Nothing is uploaded.
        </p>
      </div>
      <Generator />
    </div>
  );
}
