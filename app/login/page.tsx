"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { APP_NAME } from "@/lib/config";

export default function LoginPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [admin, setAdmin] = useState(false);
  const [next, setNext] = useState("/");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setAdmin(params.get("admin") === "1");
    setNext(params.get("next") || (params.get("admin") === "1" ? "/admin" : "/"));
  }, []);

  async function submit() {
    const password = inputRef.current?.value || "";
    if (!password) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, admin }),
      });
      if (res.ok) {
        router.push(next);
        router.refresh();
      } else {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? "Login failed");
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-b from-jj-blue/20 via-background to-jj-pink/20">
      <div className="w-full max-w-sm bg-card border border-line rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col items-center gap-3 mb-6">
          <Image src="/logo.webp" alt="Chapter logo" width={110} height={110} priority />
          <h1 className="text-2xl font-semibold text-center">{APP_NAME}</h1>
          <p className="text-sm text-muted text-center">
            {admin ? "Admin access for chapter leadership." : "For host moms of the Montgomery County, MD Chapter."}
          </p>
        </div>
        <label className="block text-sm font-medium mb-1" htmlFor="pw">
          {admin ? "Admin password" : "Chapter password"}
        </label>
        <input
          ref={inputRef}
          id="pw"
          type="password"
          autoFocus
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && inputValue && !busy) {
              submit();
            }
          }}
          className="w-full border border-line rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-jj-blue"
        />
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <button
          type="button"
          onClick={submit}
          className="w-full rounded-lg bg-jj-blue-deep text-white py-2 font-medium hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Enter"}
        </button>
        <p className="text-xs text-muted mt-4 text-center">
          {admin ? (
            <a href="/login" className="underline">Member login</a>
          ) : (
            <a href="/login?admin=1" className="underline">Leadership admin login</a>
          )}
        </p>
      </div>
    </main>
  );
}
