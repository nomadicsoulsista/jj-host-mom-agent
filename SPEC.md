# JJMCMC Host Mom Activity Planner — Spec (v0.1, 2026-10-04)

## Purpose
A web agent for Jack and Jill of America, Inc. Montgomery County MD Chapter host moms to
brainstorm, plan, and document grade-group activities aligned to the five national
programmatic thrusts.

## Users and access
- All chapter host moms. One shared chapter password (rotated yearly by leadership).
- Admin page (separate admin password) for uploading chapter documents.

## Entry modes
1. **Brainstorm** — agent shows 5–10 idea cards matched to grade group, thrust, season,
   budget. Mom picks one → flows into guided interview.
2. **Guided interview** — for a mom who already has an idea. 5–7 questions:
   grade group, idea, target thrust (or "suggest one"), date/season, budget, headcount,
   venue known?, vibe. Then drafts.

## Thrust handling
- Five national thrusts: Cultural, Educational, Civic/Legislative, Health, Social/Recreational.
- Every plan must name its primary thrust and justify alignment.
- "Re-align to a different thrust" action rewrites objectives and agenda for the new thrust.

## Outputs (all downloadable, logo + chapter colors)
- Full activity plan doc: objective, thrust alignment, agenda, supplies, budget,
  communications/RSVP, volunteer roles, post-event report notes.
- Branded flyer / invite (print + email).
- Budget + supply list (reimbursement-ready).
- Submission-ready text for chapter proposal and post-event report forms.

## Always-on guardrails
- Age-appropriateness checks (content, duration, supervision ratios by grade group).
- MoCo/DMV venue and vendor suggestions; preference for Black-owned vendors and businesses.
- Inclusion and accessibility notes (sensory, mobility, dietary, cost sensitivity).
- Service and civic tie-in prompts where they fit.

## Knowledge base (uploaded via admin page, indexed for retrieval)
- Programming guide / thrust definitions and grade-level expectations.
- Past activity reports.
- Host mom handbook and forms.

## Stack
- Next.js (App Router) on Vercel.
- Supabase: Postgres + pgvector (doc chunks), Storage (uploads, generated PDFs), saved plans.
- Claude API (claude-fable-5-1 default; claude-sonnet-5 for idea-card generation).
- PDF generation for plan + flyer.

## Brand
- Logo: brand/jjmcmc-logo.webp
- Palette: light blue #9DC3E6 (approx), dusty pink #D4A5C0 (approx), black, white.
  Confirm exact hex from chapter brand files if available.

## Grade groups (MoCo chapter)
- Poos — Pre-3, Pre-4 and under
- G2 — Kindergarten and Grade 1
- G3 — Grades 2–3
- G4 — Grades 4–5
- G5 — Grades 6–8
- G6 — Grades 9–12

## Design direction
Events should be elevated, high-end, and genuinely engaging for the age group: curated
experiences, polished presentation, memorable details. Avoid generic "pizza and a craft"
defaults unless reframed with a premium twist.

## Open items (need from Rahcyne)
- The three document sets for the knowledge base.
- Chapter form templates (proposal, post-event report) if they exist.
- Supabase project + Vercel project (or permission to create under her accounts).
- Anthropic API key placed in .env (never shared in chat).
