import type { Metadata } from "next";
import { getContent } from "@/lib/admin";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return {
    title: c.seo.privacy?.title || "Privacy Policy",
    description:
      c.seo.privacy?.description ||
      "Learn how PaperMint protects your privacy when you create invoices and rent receipts.",
  };
}
export default function Page() {
  return (
    <article
      className="container prose"
      style={{ maxWidth: 780, padding: "58px 0" }}
    >
      <h1>Privacy policy</h1>
      <p>
        <strong>Last updated: 18 October 2026</strong>
      </p>
      <h2>Receipt information</h2>
      <p>
        Tenant, landlord, PAN, address, rent and payment details are processed
        locally in your browser to render a preview and create a PDF. They are
        not submitted to PaperMint servers, saved in an account, or retained by
        us. Your browser may keep ordinary local preferences such as the
        selected color theme.
      </p>
      <h2>Site operations</h2>
      <p>
        Your hosting provider may process basic technical request data to serve
        the website and protect it from abuse.PaperMint uses Google Analytics (measurement ID G-B08GKF3PT6) to understand website usage. Google may collect information such as browser, device, and page activity. Invoice and receipt details are processed in your browser and are not intentionally sent to Google Analytics.
      </p>
      <h2>Admin area</h2>
      <p>
        If enabled by the site operator, admin credentials and site content are
        processed server-side. Do not enter receipt details in admin content.
        Ask the site operator about their configured hosting and content
        provider.
      </p>
      <h2>Your choices</h2>
      <p>
        You can close the tab to clear the receipt form. The generated PDF is
        saved only when you choose to download it.
      </p>
      <h2>Contact</h2>
      <p>Use the Contact page to reach the site operator.</p>
    </article>
  );
}
