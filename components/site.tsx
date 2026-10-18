"use client";
import Link from "next/link";
import { useEffect } from "react";
export function Header() {
  useEffect(() => {
    const v = localStorage.getItem("theme");
    const d = v
      ? v === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", d);
  }, []);
  function toggle() {
    const d = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", d);
    localStorage.setItem("theme", d ? "dark" : "light");
  }
  return (
    <header style={{ borderBottom: "1px solid var(--line)" }}>
      <div
        className="container"
        style={{
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
          <Link
          href="/"
          aria-label="PaperMint home"
          style={{ fontWeight: 800, fontSize: 21, letterSpacing: "-.6px" }}
        >
          ◈ PaperMint
        </Link>
        <nav
          aria-label="Main navigation"
          className="site-nav"
          style={{ display: "flex", alignItems: "center", gap: 20 }}
        >
          <Link className="muted" href="/invoice">
            Invoice
          </Link>
          <Link className="muted site-receipts" href="/generator">
            Rent receipt
          </Link>
          <Link className="muted site-about" href="/about">
            About
          </Link>
          <button
            onClick={toggle}
            className="pill"
            aria-label="Toggle color theme"
            title="Toggle theme"
          >
            ◐
          </button>
          <Link
            href="/invoice"
            className="btn"
            style={{ padding: "10px 14px" }}
          >
            Create invoice
          </Link>
        </nav>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--line)", marginTop: 72 }}>
      <div
        className="container"
        style={{
          padding: "28px 0",
          display: "flex",
          flexWrap: "wrap",
          gap: 18,
          justifyContent: "space-between",
          fontSize: 14,
        }}
      >
        <span className="muted">
          © {new Date().getFullYear()} PaperMint · Made for private, simple
          paperwork.
        </span>
        <nav
          aria-label="Footer navigation"
          style={{ display: "flex", gap: 18 }}
        >
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}
