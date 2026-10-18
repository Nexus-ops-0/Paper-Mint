# PaperMint — Invoices and Rent Receipts

A Next.js App Router project for creating polished invoices and printable Indian rent receipts. Invoice and receipt data is validated and rendered entirely in the browser; it is not submitted to an API or database. PDFs are generated locally with jsPDF. Rent receipts can include up to 12 monthly pages, and invoices support up to 12 line items across a clean PDF.

## Requirements

- Node.js 20.9 or newer and npm
- A Vercel Hobby project for free hosting (subject to its current plan terms and usage limits)
- No database, account, or environment variables are required for the public tools.
- Optional: a Supabase Free project only if you want to turn on persistent admin-managed copy and durable login throttling.

## Run locally

1. Install and start (no `.env.local` is required for the public tools):

   ```sh
   npm install
   npm run dev
   ```

2. Open `http://localhost:3000`. Admin stays disabled unless you configure it explicitly.

### Admin password and session secret

Generate a bcrypt hash without putting a plaintext password in project files:

```sh
npm install
node scripts/hash-password.mjs 'use-a-unique-password-at-least-16-characters'
```

Copy the output into `ADMIN_PASSWORD_HASH`. The shell command can remain in your terminal history, so use a password manager and clear that history if appropriate. Generate a session secret with Node:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Set that value as `SESSION_SECRET`. Use a different value for every environment. Never commit `.env.local` or expose `SUPABASE_SERVICE_ROLE_KEY` to browser code.

## Optional persistent admin content (no paid services required)

The website and receipt tool work without an admin database. To save admin edits between deployments, create a Supabase project on its Free plan, run [`supabase/schema.sql`](supabase/schema.sql) in its SQL editor, then configure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Admin content is read server-side. The key is used only by server routes and is never returned to the browser. Review your provider's current limits before deployment; this project does not enable billing or paid upgrades.

The admin panel is mounted at the path in `ADMIN_PATH`; set it to a long, random, single-segment path. The example in `.env.example` is only a placeholder. The path is omitted from the sitemap, disallowed in `robots.txt`, and marked `noindex`. Unauthenticated admin pages and data routes return a plain 404. The sign-in page and CSRF-checked login POST are the intentional unauthenticated exceptions needed to sign in; the sign-in response sets the CSRF cookie, and there is no unauthenticated CSRF API. All other admin APIs require a signed session. Login failures are generic, delayed, and limited to five attempts per IP per 15-minute window using the Supabase RPCs.

## Deploy to Vercel

1. Push this project to a Git provider and import it into Vercel, or use the Vercel CLI.
2. Keep the framework preset as **Next.js** and the root directory as this project folder.
3. No environment variables are needed for the public invoice and receipt tools. Vercel's assigned `*.vercel.app` address is used automatically for metadata and the sitemap. Optionally set `CONTACT_EMAIL` so visitors can reach you. Do not set admin credentials unless you have also configured the optional Supabase content store and login rate-limit schema.
4. Deploy. Use Vercel's free Hobby tier only within its current limits. Do not enable paid upgrades or add a paid domain/provider unless you choose to do so.
5. Verify the deployed checks below. The admin panel remains unavailable unless you intentionally configure its path, credentials, and Supabase store.

## Security checklist after deployment

- [ ] `ADMIN_PATH` is long, random, not linked in navigation, omitted from the sitemap, and blocked in `robots.txt`.
- [ ] Visiting the admin path and its content API while signed out returns a plain 404. The login page is the expected exception.
- [ ] Sign-in uses a bcrypt hash; `SESSION_SECRET` is unique and random; session cookie is `HttpOnly`, `Secure` on HTTPS, and `SameSite=Strict`.
- [ ] Bad credentials produce only “Invalid credentials”; after five failures from one IP, login is throttled until the window expires.
- [ ] Admin POST routes reject missing/incorrect CSRF token or cross-origin requests; logout clears the session cookie and rotates the CSRF token.
- [ ] Response headers include CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy, and Permissions-Policy.
- [ ] Confirm form data is not present in browser network requests. PDF generation should not make a request.
- [ ] Keep the Supabase service-role secret server-only and review its project usage/limits. Leave analytics disabled unless you intentionally add a privacy-friendly provider.
- [ ] Run `npm audit` before production updates and review findings rather than applying blind force fixes.

## Useful commands

```sh
npm run build
npm run lint
npm audit
```

The optional statistics panel is intentionally omitted because no analytics provider is configured. No page-view collection is sent by this starter. Admin-managed SEO fields are seeded for every public page and are used by each page's metadata generator. `npm audit --omit=dev` reports zero production vulnerabilities. Full `npm audit` currently reports five high-severity findings through `eslint-config-next` → `fast-glob` → `micromatch` → `braces`; npm offers only a breaking downgrade as an automatic fix. The finding is in development tooling, not the deployed production dependency tree. Do not use `npm audit fix --force`; recheck for upstream patches before changing this lint toolchain.

## HRA note

This utility creates a receipt template, not a tax determination. HRA eligibility and accepted documentation depend on current rules and personal circumstances. For rent above ₹1,00,000 in a financial year, an employer generally asks for landlord PAN; confirm requirements with your employer and the Income Tax Department. See [Income Tax Department FAQs](https://www.incometax.gov.in/iec/foportal/help/new-tax-vs-old-tax-regime-faqs).
