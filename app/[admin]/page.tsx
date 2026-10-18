import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AdminPanel from "@/components/admin-panel";
export const metadata: Metadata = {
  title: "Site administration",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function AdminPage({
  params,
}: {
  params: Promise<{ admin: string }>;
}) {
  const { admin } = await params;
  const route = process.env.ADMIN_PATH?.replace(/^\//, "");
  if (!route || admin !== route) notFound();
  return (
    <div className="container" style={{ maxWidth: 760, padding: "52px 0" }}>
      <AdminPanel api={`/api/${route}`} />
    </div>
  );
}
