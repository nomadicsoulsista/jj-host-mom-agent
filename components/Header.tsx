"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { APP_NAME } from "@/lib/config";

const nav = [
  { href: "/", label: "Home" },
  { href: "/plan?mode=brainstorm", label: "Brainstorm" },
  { href: "/plan?mode=plan", label: "Plan an idea" },
  { href: "/plans", label: "Saved plans" },
  { href: "/admin", label: "Admin" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header className="no-print border-b border-line bg-card/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.webp" alt="Jack and Jill Montgomery County MD Chapter" width={44} height={44} priority />
          <div className="leading-tight">
            <div className="serif text-lg font-semibold">{APP_NAME}</div>
            <div className="text-xs text-muted">Montgomery County, MD Chapter</div>
          </div>
        </Link>
        <nav className="ml-auto hidden sm:flex items-center gap-1 text-sm">
          {nav.map((n) => {
            const active = pathname === n.href.split("?")[0] && (n.href.includes("?") ? false : true);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`px-3 py-1.5 rounded-full hover:bg-jj-blue/30 ${active ? "bg-jj-blue/40" : ""}`}
              >
                {n.label}
              </Link>
            );
          })}
          <button onClick={logout} className="px-3 py-1.5 rounded-full text-muted hover:bg-jj-pink/30">
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}
