"use client";

import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Header from "@/components/Header";

type Plan = { id: string; title: string; grade_group: string | null; thrust: string | null; created_at: string; content: string };

async function fetchPlans(): Promise<{ plans?: Plan[]; configured?: boolean }> {
  const res = await fetch("/api/plans");
  return res.json();
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [configured, setConfigured] = useState(true);
  const [open, setOpen] = useState<Plan | null>(null);

  const load = useCallback(() => {
    return fetchPlans().then((j) => {
      setPlans(j.plans ?? []);
      setConfigured(j.configured !== false);
    });
  }, []);

  useEffect(() => {
    let ignore = false;
    fetchPlans().then((j) => {
      if (ignore) return;
      setPlans(j.plans ?? []);
      setConfigured(j.configured !== false);
    });
    return () => {
      ignore = true;
    };
  }, []);

  async function remove(p: Plan) {
    if (!confirm(`Delete "${p.title}"?`)) return;
    await fetch("/api/plans", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id }) });
    if (open?.id === p.id) setOpen(null);
    load();
  }

  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-8 grid md:grid-cols-[280px_1fr] gap-6">
        <aside className="no-print">
          <h1 className="text-2xl font-semibold mb-3">Saved plans</h1>
          {!configured && <p className="text-sm text-muted">Supabase is not configured, so plans cannot be saved yet.</p>}
          {configured && plans.length === 0 && <p className="text-sm text-muted">No plans saved yet.</p>}
          <ul className="grid gap-2">
            {plans.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => setOpen(p)}
                  className={`w-full text-left border rounded-xl px-3 py-2 bg-card hover:border-jj-blue ${open?.id === p.id ? "border-jj-blue-deep" : "border-line"}`}
                >
                  <div className="text-sm font-medium">{p.title}</div>
                  <div className="text-xs text-muted">
                    {[p.grade_group, p.thrust].filter(Boolean).join(" · ") || "—"} · {new Date(p.created_at).toLocaleDateString()}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <section>
          {open ? (
            <div className="bg-card border border-line rounded-2xl px-6 py-5 prose-jj text-[15px] print-sheet">
              <div className="no-print flex gap-2 justify-end mb-2">
                <button onClick={() => window.print()} className="text-xs px-3 py-1.5 rounded-full border border-line hover:bg-jj-blue/30">
                  Print / PDF
                </button>
                <button onClick={() => remove(open)} className="text-xs px-3 py-1.5 rounded-full border border-line text-red-700 hover:bg-red-50">
                  Delete
                </button>
              </div>
              <div className="print-only mb-4 text-xs text-muted">Jack and Jill of America, Inc. · Montgomery County, MD Chapter</div>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{open.content}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-muted">Select a plan to view it.</p>
          )}
        </section>
      </main>
    </>
  );
}
