import Chat from "@/components/Chat";
import Header from "@/components/Header";

export default async function PlanPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const raw = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const mode = raw === "brainstorm" ? "brainstorm" : "plan";
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">
        <Chat key={mode} mode={mode} />
      </main>
    </>
  );
}
