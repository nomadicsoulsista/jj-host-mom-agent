# Host Mom Activity Planner — Jack and Jill MoCo MD Chapter

A password-protected web app that helps host moms brainstorm and plan elevated, thrust-aligned grade-group activities.

See `SPEC.md` for product decisions.

## Local setup

```bash
npm install
cp .env.example .env.local   # then fill in values
npm run dev -- -p 3010
```

Required env vars:

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API key (server-side only) |
| `CLAUDE_MODEL` | Defaults to `claude-opus-5` |
| `CHAPTER_PASSWORD` | Shared password for host moms |
| `ADMIN_PASSWORD` | Leadership password for the document upload page |
| `SESSION_SECRET` | Any long random string |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Optional. Enables document uploads and saved plans |

## Supabase

1. Create a project at supabase.com.
2. Open the SQL editor and run `supabase/schema.sql`.
3. Copy the project URL and the **service role** key into the env vars above. Never expose the service role key to the browser; this app only reads it in route handlers.

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. Import it in Vercel, framework Next.js.
3. Add the env vars from the table above in Project Settings → Environment Variables.
4. Deploy. Share the URL and the chapter password with host moms.

## How it works

- `proxy.ts` gates every page and API route behind the chapter cookie; `/admin` needs the admin cookie.
- `app/api/chat/route.ts` streams Claude responses. The system prompt in `lib/prompt.ts` carries the grade groups, the five thrusts, the elevated design standard, guardrails, and the output formats. Uploaded chapter documents are appended to the prompt and cached.
- `components/Chat.tsx` runs both modes (brainstorm, guided interview) with quick actions: re-align thrust, flyer, budget and supplies, form-ready text, elevate, lower cost, save, print to PDF.
- `app/admin` uploads PDF, TXT, or MD into the `chapter_docs` table. `app/plans` lists saved plans.
