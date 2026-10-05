"use client";

import { useCallback, useEffect, useState } from "react";
import Header from "@/components/Header";

type Doc = { id: string; title: string; created_at: string; chars: number };

async function fetchDocs(): Promise<{ docs?: Doc[]; configured?: boolean }> {
  const res = await fetch("/api/admin/docs");
  return res.json();
}

export default function AdminPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [configured, setConfigured] = useState(true);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    return fetchDocs().then((j) => {
      setDocs(j.docs ?? []);
      setConfigured(j.configured !== false);
    });
  }, []);

  useEffect(() => {
    let ignore = false;
    fetchDocs().then((j) => {
      if (ignore) return;
      setDocs(j.docs ?? []);
      setConfigured(j.configured !== false);
    });
    return () => {
      ignore = true;
    };
  }, []);

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setStatus("Uploading and extracting text…");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", title);
    const res = await fetch("/api/admin/docs", { method: "POST", body: fd });
    const j = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setStatus(`Added "${j.title}" (${j.chars.toLocaleString()} characters).`);
      setTitle("");
      setFile(null);
      (document.getElementById("file") as HTMLInputElement | null)?.form?.reset();
      load();
    } else {
      setStatus(j.error ?? "Upload failed");
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Remove "${name}" from the knowledge base?`)) return;
    await fetch("/api/admin/docs", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-8">
        <h1 className="text-3xl font-semibold mb-1">Chapter knowledge base</h1>
        <p className="text-sm text-muted mb-6">
          Upload the programming guide, host mom handbook, forms, and past activity reports. The planner reads every
          document here on each request, so keep titles clear and remove outdated versions.
        </p>

        {!configured && (
          <div className="border border-jj-pink bg-jj-pink/20 rounded-xl p-4 text-sm mb-6">
            Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable uploads and saved plans.
          </div>
        )}

        <form onSubmit={upload} className="border border-line bg-card rounded-2xl p-5 mb-8 grid gap-3">
          <label className="text-sm font-medium">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 2026-27 Programming Guide"
              className="mt-1 w-full border border-line rounded-lg px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-medium">
            File (PDF, TXT, or MD)
            <input
              id="file"
              type="file"
              accept=".pdf,.txt,.md,text/plain,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 block text-sm"
            />
          </label>
          <div className="flex items-center gap-3">
            <button disabled={!file || busy || !configured} className="rounded-lg bg-jj-blue-deep text-white px-4 py-2 text-sm disabled:opacity-50">
              {busy ? "Working…" : "Upload"}
            </button>
            {status && <span className="text-sm text-muted">{status}</span>}
          </div>
        </form>

        <h2 className="text-xl font-semibold mb-3">Documents ({docs.length})</h2>
        {docs.length === 0 ? (
          <p className="text-sm text-muted">Nothing uploaded yet.</p>
        ) : (
          <ul className="divide-y divide-line border border-line rounded-xl bg-card">
            {docs.map((d) => (
              <li key={d.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                <div className="flex-1">
                  <div className="font-medium">{d.title}</div>
                  <div className="text-xs text-muted">
                    {new Date(d.created_at).toLocaleDateString()} · {d.chars.toLocaleString()} chars
                  </div>
                </div>
                <button onClick={() => remove(d.id, d.title)} className="text-xs text-red-700 hover:underline">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
