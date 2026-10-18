"use client";
import { useEffect, useState } from "react";
import type { Content } from "@/lib/admin";
const empty: Content = {
  headline: "",
  subheadline: "",
  banner: "",
  faqs: [],
  seo: {},
};
export default function AdminPanel({ api }: { api: string }) {
  const [username, setUsername] = useState(""),
    [password, setPassword] = useState(""),
    [logged, setLogged] = useState(false),
    [data, setData] = useState(empty),
    [message, setMessage] = useState("");
  useEffect(() => {
    fetch(`${api}/content`, { cache: "no-store" })
      .then(async (r) => {
        if (r.ok) {
          setData(await r.json());
          setLogged(true);
        }
      })
      .catch(() => {});
  }, [api]);
  async function request(path: string, body?: unknown) {
    const token = decodeURIComponent(
      document.cookie
        .split(";")
        .map((x) => x.trim())
        .find((x) => x.startsWith("rent_admin_csrf="))
        ?.split("=")
        .slice(1)
        .join("=") || "",
    );
    const response = await fetch(`${api}/${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-csrf-token": token },
      body: JSON.stringify(body || {}),
    });
    if (!response.ok)
      throw new Error(response.status === 404 ? "Not found" : "Request failed");
    return response.json();
  }
  async function login(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    try {
      await request("login", { username, password });
      const r = await fetch(`${api}/content`, { cache: "no-store" });
      if (!r.ok) throw new Error();
      setData(await r.json());
      setLogged(true);
      setPassword("");
    } catch {
      setMessage("Invalid credentials");
    }
  }
  async function save() {
    setMessage("");
    try {
      await request("content", data);
      setMessage("Saved site content.");
    } catch {
      setMessage("Could not save. Check the content database configuration.");
    }
  }
  async function logout() {
    try {
      await request("logout", {});
      setLogged(false);
      setData(empty);
      setMessage("Signed out.");
    } catch {
      setMessage("Could not sign out.");
    }
  }
  if (!logged)
    return (
      <section
        className="surface"
        style={{ maxWidth: 440, margin: "60px auto", padding: 28 }}
      >
        <p className="accent" style={{ fontWeight: 700 }}>
          Restricted
        </p>
        <h1 style={{ marginTop: 0 }}>Admin sign in</h1>
        <p className="muted">This private area is for the site operator.</p>
        <form onSubmit={login} style={{ display: "grid", gap: 16 }}>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              className="control"
              id="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              className="control"
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn">Sign in</button>
          {message && (
            <p role="alert" style={{ color: "#bd3030", margin: 0 }}>
              {message}
            </p>
          )}
        </form>
      </section>
    );
  const text = (
    label: string,
    key: "headline" | "subheadline" | "banner",
    multi = false,
  ) => (
    <div className="field">
      <label>{label}</label>
      {multi ? (
        <textarea
          className="control"
          rows={3}
          value={data[key]}
          onChange={(e) => setData({ ...data, [key]: e.target.value })}
        />
      ) : (
        <input
          className="control"
          value={data[key]}
          onChange={(e) => setData({ ...data, [key]: e.target.value })}
        />
      )}
    </div>
  );
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div>
          <span className="accent" style={{ fontWeight: 700 }}>
            PaperMint
          </span>
          <h1 style={{ margin: "8px 0" }}>Site content</h1>
        </div>
        <button className="btn btn-secondary" onClick={logout}>
          Log out
        </button>
      </div>
      <p className="muted">
        Content is plain text. Tags and markup are stripped before saving.
      </p>
      <section
        className="surface"
        style={{ padding: 24, display: "grid", gap: 20 }}
      >
        <h2 style={{ margin: 0 }}>Homepage</h2>
        {text("Headline", "headline")}
        {text("Subheading", "subheadline", true)}
        {text("Announcement banner (blank hides it)", "banner")}
        <div>
          <h2>FAQ entries</h2>
          {data.faqs.map((faq, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gap: 10,
                padding: "14px 0",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <input
                aria-label={`FAQ ${i + 1} question`}
                className="control"
                value={faq.q}
                onChange={(e) =>
                  setData({
                    ...data,
                    faqs: data.faqs.map((x, j) =>
                      j === i ? { ...x, q: e.target.value } : x,
                    ),
                  })
                }
              />
              <textarea
                aria-label={`FAQ ${i + 1} answer`}
                className="control"
                rows={2}
                value={faq.a}
                onChange={(e) =>
                  setData({
                    ...data,
                    faqs: data.faqs.map((x, j) =>
                      j === i ? { ...x, a: e.target.value } : x,
                    ),
                  })
                }
              />
              <button
                className="btn btn-secondary"
                style={{ justifySelf: "start" }}
                onClick={() =>
                  setData({
                    ...data,
                    faqs: data.faqs.filter((_, j) => j !== i),
                  })
                }
              >
                Remove FAQ
              </button>
            </div>
          ))}
          <button
            className="btn btn-secondary"
            style={{ marginTop: 12 }}
            disabled={data.faqs.length >= 12}
            onClick={() =>
              setData({ ...data, faqs: [...data.faqs, { q: "", a: "" }] })
            }
          >
            Add FAQ
          </button>
        </div>
        <div>
          <h2>SEO metadata</h2>
          {Object.entries(data.seo).map(([page, seo]) => (
            <div
              key={page}
              style={{ display: "grid", gap: 10, marginBottom: 16 }}
            >
              <strong>{page}</strong>
              <input
                aria-label={`${page} SEO title`}
                className="control"
                value={seo.title}
                onChange={(e) =>
                  setData({
                    ...data,
                    seo: {
                      ...data.seo,
                      [page]: { ...seo, title: e.target.value },
                    },
                  })
                }
              />
              <textarea
                aria-label={`${page} SEO description`}
                className="control"
                rows={2}
                value={seo.description}
                onChange={(e) =>
                  setData({
                    ...data,
                    seo: {
                      ...data.seo,
                      [page]: { ...seo, description: e.target.value },
                    },
                  })
                }
              />
            </div>
          ))}
        </div>
        <button className="btn" onClick={save}>
          Save changes
        </button>
        {message && <p role="status">{message}</p>}
      </section>
    </>
  );
}
