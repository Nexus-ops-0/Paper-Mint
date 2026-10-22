import Script from "next/script";
import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer } from "@/components/site";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "Free Invoice & Rent Receipt Tools for India | PaperMint",
    template: "%s | PaperMint",
  },
  description:
    "Create polished invoice PDFs and rent receipts for HRA records. Free, private, and right in your browser.",
  openGraph: {
    type: "website",
    siteName: "PaperMint",
    title: "Free Invoice & Rent Receipt Tools for India",
    description: "Create private, printable invoices and rent receipts in your browser.",
  },
  robots: { index: true, follow: true },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Script
  src="https://www.googletagmanager.com/gtag/js?id=G-B08GKF3PT6"
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-B08GKF3PT6');
  `}
</Script>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
