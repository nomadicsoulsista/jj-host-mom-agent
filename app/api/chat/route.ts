import Anthropic from "@anthropic-ai/sdk";
import { buildSystem, type Mode } from "@/lib/prompt";
import { loadChapterDocs } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 300;

const MODEL = process.env.CLAUDE_MODEL ?? "claude-opus-5";

type ChatBody = {
  mode: Mode;
  messages: Anthropic.Beta.BetaMessageParam[];
};

export async function POST(req: Request) {
  const body = (await req.json()) as ChatBody;
  if (!body?.messages?.length) return new Response("messages required", { status: 400 });
  const mode: Mode = body.mode === "brainstorm" ? "brainstorm" : "plan";

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response("_The planner is not connected to Claude yet. Ask chapter leadership to add the ANTHROPIC_API_KEY._", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  const client = new Anthropic();
  const docs = await loadChapterDocs();
  const system = buildSystem(mode, docs);

  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium" },
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    messages: body.messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode("\n\n_That request could not be completed. Please rephrase and try again._"));
        } else if (final.stop_reason === "max_tokens") {
          controller.enqueue(encoder.encode("\n\n_Response was cut short. Ask me to continue._"));
        }
      } catch (err) {
        const msg = err instanceof Anthropic.APIError ? `${err.status} ${err.message}` : String(err);
        controller.enqueue(encoder.encode(`\n\n_Error: ${msg}_`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
