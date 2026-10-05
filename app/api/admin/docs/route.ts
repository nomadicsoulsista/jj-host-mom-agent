import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

async function extractText(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buf });
    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }
  return buf.toString("utf8");
}

export async function GET() {
  const sb = supabase();
  if (!sb) return NextResponse.json({ docs: [], configured: false });
  const { data, error } = await sb
    .from("chapter_docs")
    .select("id, title, created_at, content")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const docs = (data ?? []).map((d) => ({ id: d.id, title: d.title, created_at: d.created_at, chars: d.content.length }));
  return NextResponse.json({ docs, configured: true });
}

export async function POST(req: Request) {
  const sb = supabase();
  if (!sb) return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  const form = await req.formData();
  const file = form.get("file");
  const titleField = form.get("title");
  if (!(file instanceof File)) return NextResponse.json({ error: "file required" }, { status: 400 });
  // Postgres text columns reject NUL bytes, which some PDF extractors emit.
  const content = (await extractText(file)).split("\0").join("").trim();
  if (!content) return NextResponse.json({ error: "No readable text found in file" }, { status: 400 });
  const title = typeof titleField === "string" && titleField.trim() ? titleField.trim() : file.name;
  const { error } = await sb.from("chapter_docs").insert({ title, content });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, title, chars: content.length });
}

export async function DELETE(req: Request) {
  const sb = supabase();
  if (!sb) return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const { error } = await sb.from("chapter_docs").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
