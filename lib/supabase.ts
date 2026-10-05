import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!client) client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export type ChapterDoc = { id: string; title: string; content: string; created_at: string };
export type SavedPlan = { id: string; title: string; grade_group: string | null; thrust: string | null; content: string; created_at: string };

const MAX_DOC_CHARS = 150_000;

export async function loadChapterDocs(): Promise<string> {
  const sb = supabase();
  if (!sb) return "";
  const { data, error } = await sb.from("chapter_docs").select("title, content").order("created_at");
  if (error || !data) return "";
  let out = "";
  for (const d of data) {
    const block = `\n### ${d.title}\n${d.content}\n`;
    if (out.length + block.length > MAX_DOC_CHARS) break;
    out += block;
  }
  return out;
}
