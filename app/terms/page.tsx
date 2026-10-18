import type { Metadata } from "next";
import { getContent } from "@/lib/admin";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return {
    title: c.seo.terms?.title || "Terms of Use",
    description:
      c.seo.terms?.description ||
      "Terms for using PaperMint's free invoice and rent receipt tools.",
  };
}
export default function Page() {
  return (
    <article
      className="container prose"
      style={{ maxWidth: 780, padding: "58px 0" }}
    >
      <h1>Terms of use</h1>
      <p>
        <strong>Last updated: 18 October 2026</strong>
      </p>
      <p>
        PaperMint is provided as a free document-generation utility. You are
        responsible for the accuracy and lawful use of information entered and
        documents produced.
      </p>
      <h2>No tax or legal advice</h2>
      <p>
        The tool does not determine HRA eligibility or validate a rent payment.
        A generated receipt is not a guarantee that an employer or tax authority
        will accept a claim. Check current requirements with your employer or a
        qualified adviser.
      </p>
      <h2>Availability</h2>
      <p>
        The service is provided without a promise of uninterrupted availability
        or suitability for a particular purpose. Keep your own copy of any
        downloaded documents.
      </p>
      <h2>Changes</h2>
      <p>
        These terms may be updated as the service changes. Continued use after
        an update means you accept the revised terms.
      </p>
    </article>
  );
}
