import Link from "next/link";
import Header from "@/components/Header";
import { GRADE_GROUPS, THRUSTS } from "@/lib/config";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-10">
        <section className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-semibold mb-3">Plan something they will remember.</h1>
          <p className="text-muted max-w-2xl mx-auto">
            Elevated, age-right activities for every grade group, aligned to a programmatic thrust, with the plan,
            flyer, budget, and form text ready to go.
          </p>
        </section>

        <section className="grid sm:grid-cols-2 gap-5 mb-12">
          <Link
            href="/plan?mode=brainstorm"
            className="group rounded-2xl border border-line bg-card p-7 shadow-sm hover:shadow-md hover:border-jj-blue transition"
          >
            <div className="text-xs uppercase tracking-wide text-jj-blue-deep font-semibold mb-2">Start here if you need ideas</div>
            <h2 className="text-2xl font-semibold mb-2">Brainstorm</h2>
            <p className="text-sm text-muted">
              Tell us the grade group and season. Get 6 to 8 curated idea cards, pick one, and we build it out together.
            </p>
            <div className="mt-4 text-sm font-medium group-hover:underline">Browse ideas →</div>
          </Link>
          <Link
            href="/plan?mode=plan"
            className="group rounded-2xl border border-line bg-card p-7 shadow-sm hover:shadow-md hover:border-jj-pink transition"
          >
            <div className="text-xs uppercase tracking-wide text-jj-pink-deep font-semibold mb-2">Start here if you have an idea</div>
            <h2 className="text-2xl font-semibold mb-2">Plan an idea</h2>
            <p className="text-sm text-muted">
              Describe your idea in a sentence. A short guided interview turns it into a full, polished plan.
            </p>
            <div className="mt-4 text-sm font-medium group-hover:underline">Begin the interview →</div>
          </Link>
        </section>

        <section className="grid md:grid-cols-2 gap-8 text-sm">
          <div>
            <h3 className="text-lg font-semibold mb-3">Grade groups</h3>
            <ul className="divide-y divide-line border border-line rounded-xl bg-card">
              {GRADE_GROUPS.map((g) => (
                <li key={g.id} className="flex justify-between px-4 py-2">
                  <span className="font-medium">{g.label}</span>
                  <span className="text-muted">{g.grades}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Programmatic thrusts</h3>
            <ul className="divide-y divide-line border border-line rounded-xl bg-card">
              {THRUSTS.map((t) => (
                <li key={t.id} className="px-4 py-2">
                  <span className="font-medium">{t.label}</span>
                  <span className="text-muted"> · {t.blurb}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
