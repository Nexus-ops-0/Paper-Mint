/** Resolve the public origin without requiring a custom domain on Vercel. */
export function getSiteUrl() {
  const configured =
    process.env.SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "https://example.com";

  try {
    return new URL(configured);
  } catch {
    // A malformed deployment variable should not crash static generation.
    return new URL("https://example.com");
  }
}
