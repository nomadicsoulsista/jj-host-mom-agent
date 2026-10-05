import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const sb = supabase();
  if (!sb) return NextResponse.json({ plans: [], configured: false });
  const { data, error } = await sb
    .from("plans")
    .select("id, title, grade_group, thrust, created_at, content")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plans: data ?? [], configured: true });
}

export async function POST(req: Request) {
  const sb = supabase();
  if (!sb) return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  const { title, grade_group, thrust, content } = (await req.json()) as {
    title?: string;
    grade_group?: string;
    thrust?: string;
    content?: string;
  };
  if (!content?.trim()) return NextResponse.json({ error: "content required" }, { status: 400 });
  const { data, error } = await sb
    .from("plans")
    .insert({ title: title?.trim() || "Untitled plan", grade_group: grade_group ?? null, thrust: thrust ?? null, content })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}

export async function DELETE(req: Request) {
  const sb = supabase();
  if (!sb) return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const { error } = await sb.from("plans").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
