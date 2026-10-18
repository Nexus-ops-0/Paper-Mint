import type { Metadata } from "next";
import { getContent } from "@/lib/admin";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return {
    title: c.seo.contact?.title || "Contact PaperMint",
    description:
      c.seo.contact?.description ||
      "Contact the RentSlip site operator with a question or issue.",
  };
}
export default function Page() {
  const email = process.env.CONTACT_EMAIL;
  return (
    <article
      className="container prose"
      style={{ maxWidth: 780, padding: "58px 0" }}
    >
      <h1>Contact</h1>
      {email ? (
        <p>
          For help with this site, contact the operator at{" "}
          <a className="accent" href={`mailto:${email}`}>
            {email}
          </a>
          .
        </p>
      ) : (
        <p>
          A support email has not been configured yet. Add <code>CONTACT_EMAIL</code>
          in your deployment settings before sharing the site publicly.
        </p>
      )}
    </article>
  );
}
