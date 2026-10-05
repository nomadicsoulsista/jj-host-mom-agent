"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { GRADE_GROUPS, THRUSTS } from "@/lib/config";
import type { Mode } from "@/lib/prompt";

type Msg = { role: "user" | "assistant"; content: string };

const QUICK_ACTIONS: { label: string; prompt: string }[] = [
  { label: "Re-align thrust", prompt: "__thrust__" },
  { label: "Flyer copy", prompt: "Give me the FLYER for this activity." },
  { label: "Budget & supplies", prompt: "Give me the BUDGET AND SUPPLIES for this activity." },
  { label: "Form-ready text", prompt: "Give me the FORM-READY TEXT for this activity." },
  { label: "Make it more elevated", prompt: "Elevate this further. Keep the same core idea but raise the polish, hospitality, and memorability. Show me the revised plan." },
  { label: "Lower the cost", prompt: "Bring the cost per child down by about a third without losing the elevated feel. Show me the revised plan and what changed." },
];

export default function Chat({ mode }: { mode: Mode }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [gradeGroup, setGradeGroup] = useState<string>("");
  const [showThrust, setShowThrust] = useState(false);
  const [saveState, setSaveState] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const intro =
    mode === "brainstorm"
      ? "Pick a grade group, add the season or month and a rough budget if you know them, and I will bring you a set of elevated ideas."
      : "Describe your idea in a sentence or two. I will ask a few questions, then write the full plan.";

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const groupNote = gradeGroup && messages.length === 0 ? `Grade group: ${gradeGroup}. ` : "";
    const userMsg: Msg = { role: "user", content: groupNote + trimmed };
    const history = [...messages, userMsg];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    setShowThrust(false);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, messages: history }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const t = await res.text();
        setMessages([...history, { role: "assistant", content: `_Error: ${t || res.statusText}_` }]);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const snapshot = acc;
        setMessages([...history, { role: "assistant", content: snapshot }]);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages([...history, { role: "assistant", content: `_Error: ${String(err)}_` }]);
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant" && m.content.trim());
  const hasPlan = Boolean(lastAssistant && /^#\s/m.test(lastAssistant.content));

  async function savePlan() {
    if (!lastAssistant) return;
    setSaveState("Saving…");
    const title = lastAssistant.content.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? "Untitled plan";
    const thrust = THRUSTS.find((t) => new RegExp(`\\*\\*Primary thrust\\*\\*[^\\n]*${t.label.split(" ")[0]}`, "i").test(lastAssistant.content))?.label ?? null;
    const res = await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, grade_group: gradeGroup || null, thrust, content: lastAssistant.content }),
    });
    const j = await res.json().catch(() => ({}));
    setSaveState(res.ok ? "Saved to chapter plans." : j.error ?? "Could not save.");
    setTimeout(() => setSaveState(null), 4000);
  }

  function printLast() {
    window.print();
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="no-print mx-auto max-w-3xl w-full px-4 pt-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h1 className="text-3xl font-semibold">{mode === "brainstorm" ? "Brainstorm" : "Plan an idea"}</h1>
          <select
            value={gradeGroup}
            onChange={(e) => setGradeGroup(e.target.value)}
            className="ml-auto border border-line rounded-full px-3 py-1.5 text-sm bg-card"
            aria-label="Grade group"
          >
            <option value="">Grade group…</option>
            {GRADE_GROUPS.map((g) => (
              <option key={g.id} value={`${g.id} (${g.grades})`}>
                {g.label} · {g.grades}
              </option>
            ))}
          </select>
        </div>
        {messages.length === 0 && <p className="text-muted text-sm mb-4">{intro}</p>}
      </div>

      <div className="mx-auto max-w-3xl w-full px-4 flex-1">
        {messages.map((m, i) => (
          <div key={i} className={`my-3 ${m.role === "user" ? "no-print flex justify-end" : ""}`}>
            {m.role === "user" ? (
              <div className="bg-jj-blue/30 rounded-2xl rounded-br-sm px-4 py-2 max-w-[85%] whitespace-pre-wrap text-sm">{m.content}</div>
            ) : (
              <div className={`bg-card border border-line rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm prose-jj text-[15px] print-sheet ${i === messages.length - 1 ? "" : "no-print"}`}>
                <div className="print-only mb-4 text-xs text-muted">Jack and Jill of America, Inc. · Montgomery County, MD Chapter</div>
                {m.content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                ) : (
                  <span className="text-muted animate-pulse">Thinking…</span>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="no-print sticky bottom-0 bg-background/95 backdrop-blur border-t border-line">
        <div className="mx-auto max-w-3xl w-full px-4 py-3">
          {lastAssistant && !busy && (
            <div className="flex flex-wrap gap-2 mb-2">
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.label}
                  onClick={() => (a.prompt === "__thrust__" ? setShowThrust((v) => !v) : send(a.prompt))}
                  className="text-xs px-3 py-1.5 rounded-full border border-line bg-card hover:bg-jj-pink/30"
                >
                  {a.label}
                </button>
              ))}
              {hasPlan && (
                <>
                  <button onClick={savePlan} className="text-xs px-3 py-1.5 rounded-full bg-jj-blue-deep text-white hover:opacity-90">
                    Save plan
                  </button>
                  <button onClick={printLast} className="text-xs px-3 py-1.5 rounded-full border border-line bg-card hover:bg-jj-blue/30">
                    Print / PDF
                  </button>
                </>
              )}
              {saveState && <span className="text-xs text-muted self-center">{saveState}</span>}
            </div>
          )}
          {showThrust && (
            <div className="flex flex-wrap gap-2 mb-2">
              {THRUSTS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => send(`Re-align this activity to the ${t.label} thrust. Rewrite the objective, agenda, and framing so ${t.label} is genuinely central, and show me the full revised plan.`)}
                  className="text-xs px-3 py-1.5 rounded-full bg-jj-pink/40 hover:bg-jj-pink/70"
                >
                  → {t.label}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={2}
              placeholder={mode === "brainstorm" ? "e.g. Group 4, November, around $40 per child" : "e.g. A chef-led cooking workshop for Group 3 in February"}
              className="flex-1 border border-line rounded-xl px-3 py-2 text-sm bg-card resize-none focus:outline-none focus:ring-2 focus:ring-jj-blue"
            />
            {busy ? (
              <button type="button" onClick={stop} className="rounded-xl px-4 border border-line bg-card text-sm">
                Stop
              </button>
            ) : (
              <button type="submit" disabled={!input.trim()} className="rounded-xl px-4 bg-jj-blue-deep text-white text-sm disabled:opacity-50">
                Send
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
