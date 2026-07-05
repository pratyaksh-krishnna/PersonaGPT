# Dark Theme + Homepage Trim Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the app to a single permanent dark theme, and condense the homepage (`app/page.tsx`) into one non-scrolling screen with the "How it works" section removed and a one-line footer credit.

**Architecture:** The palette is centralized as named Tailwind v4 tokens in the `@theme` block of `app/globals.css`. Redefine those token values to dark equivalents; fix the handful of call sites that pair a token as both background and foreground text (since `ink`/`paper` flip from dark/light to light/dark). Separately, rewrite `app/page.tsx` to drop two sections and simplify layout/footer.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4 (`@theme` tokens in `app/globals.css`), TypeScript, no test runner configured (verification is `npm run lint`, `npx tsc --noEmit`, and manual browser check via `npm run dev`).

## Global Constraints

- No dark/light toggle and no `prefers-color-scheme` — the theme is always dark (per spec §1).
- Footer credit text must read exactly: `Made by Pratyaksh Krishnna` (exact spelling confirmed by user — do not "correct" to "Krishna").
- `app/page.tsx` must not scroll (`h-dvh` + `overflow-hidden` on the outer container, not `min-h-dvh`).
- No changes to `app/chat/[persona]/chat-screen.tsx` beyond the single `text-paper` → `text-parchment` color-pairing fix.
- No changes to `lib/personas.ts` content beyond the `text-paper` → `text-white` color-pairing fix in the two `theme` objects.

---

### Task 1: Dark palette tokens in `app/globals.css`

**Files:**
- Modify: `app/globals.css:1-43` (the `@theme` block and the `body` rule and scrollbar rules)

**Interfaces:**
- Produces: new dark values for the CSS custom properties `--color-parchment`, `--color-paper`, `--color-ink`, `--color-ink-soft`, `--color-line`, `--color-pine`, `--color-pine-deep`, `--color-pine-mist`, `--color-ember`, `--color-ember-deep`, `--color-ember-mist`. Tasks 2 and 3 depend on these existing but do not depend on their exact values.

- [ ] **Step 1: Replace the `@theme` color block**

In `app/globals.css`, replace lines 1-16 (the `@import` line through the closing `}` of the first `@theme` block) with:

```css
@import "tailwindcss";

@theme {
  /* Warm editorial palette — dark charcoal, cream ink, pine, ember */
  --color-parchment: #17140f;
  --color-paper: #221e19;
  --color-ink: #f3ece0;
  --color-ink-soft: #a89985;
  --color-line: #3a352c;
  --color-pine: #3f8f68;
  --color-pine-deep: #5cae87;
  --color-pine-mist: #1c3a2c;
  --color-ember: #c1512e;
  --color-ember-deep: #e2774a;
  --color-ember-mist: #3a2015;
}
```

- [ ] **Step 2: Add `color-scheme: dark` and lighten the scrollbar thumb**

Replace the `body` rule and the scrollbar rules (originally lines 24-42) with:

```css
body {
  background: var(--color-parchment);
  color: var(--color-ink);
  font-family: var(--font-sans), Arial, Helvetica, sans-serif;
  color-scheme: dark;
}

* {
  scrollbar-width: thin;
  scrollbar-color: rgba(200, 190, 172, 0.3) transparent;
}

*::-webkit-scrollbar {
  width: 8px;
}

*::-webkit-scrollbar-thumb {
  background: rgba(200, 190, 172, 0.3);
  border-radius: 9999px;
}
```

Leave the `@theme inline` block (font variables) and the `@keyframes`/`.animate-*` rules below it untouched.

- [ ] **Step 3: Verify no build errors**

Run: `cd /Users/basantnarayansingh/projects/chatbot && npx tsc --noEmit && npm run lint`
Expected: both commands exit 0 with no errors (CSS changes don't affect TS/lint, but this confirms the repo is otherwise healthy before further edits).

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "Recolor theme tokens for a permanent dark palette"
```

---

### Task 2: Fix `text-paper` color pairings in `lib/personas.ts` and `chat-screen.tsx`

**Files:**
- Modify: `lib/personas.ts:45-51` and `lib/personas.ts:68-74`
- Modify: `app/chat/[persona]/chat-screen.tsx:240-245`

**Interfaces:**
- Consumes: the token values from Task 1 (`ink` is now light, `pine`/`ember` stay mid-dark).
- Produces: no new interfaces — this only changes literal className strings.

- [ ] **Step 1: Update the persona theme objects**

In `lib/personas.ts`, change persona `A`'s theme (originally lines 45-51) from:

```ts
    theme: {
      badge: "bg-pine text-paper",
      action: "bg-pine text-paper hover:bg-pine-deep",
      accentText: "text-pine",
      mist: "bg-pine-mist",
      hoverBorder: "hover:border-pine/50",
    },
```

to:

```ts
    theme: {
      badge: "bg-pine text-white",
      action: "bg-pine text-white hover:bg-pine-deep",
      accentText: "text-pine",
      mist: "bg-pine-mist",
      hoverBorder: "hover:border-pine/50",
    },
```

And persona `B`'s theme (originally lines 68-74) from:

```ts
    theme: {
      badge: "bg-ember text-paper",
      action: "bg-ember text-paper hover:bg-ember-deep",
      accentText: "text-ember",
      mist: "bg-ember-mist",
      hoverBorder: "hover:border-ember/50",
    },
```

to:

```ts
    theme: {
      badge: "bg-ember text-white",
      action: "bg-ember text-white hover:bg-ember-deep",
      accentText: "text-ember",
      mist: "bg-ember-mist",
      hoverBorder: "hover:border-ember/50",
    },
```

- [ ] **Step 2: Update the user chat bubble in `chat-screen.tsx`**

In `app/chat/[persona]/chat-screen.tsx`, change (originally lines 240-245):

```tsx
              <div
                className={`max-w-[75%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "rounded-br-sm bg-ink text-paper"
                    : "rounded-bl-sm border border-line bg-paper text-ink"
                }`}
              >
```

to:

```tsx
              <div
                className={`max-w-[75%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "rounded-br-sm bg-ink text-parchment"
                    : "rounded-bl-sm border border-line bg-paper text-ink"
                }`}
              >
```

- [ ] **Step 3: Verify types and lint**

Run: `cd /Users/basantnarayansingh/projects/chatbot && npx tsc --noEmit && npm run lint`
Expected: both commands exit 0 with no errors.

- [ ] **Step 4: Manual visual check**

Run: `npm run dev`, open `http://localhost:3000/chat/hitesh` in a browser, type a message and send it.
Expected: the user's own message bubble has a light cream background (`bg-ink`) with dark, readable text (`text-parchment`) — not light-on-light. The assistant's reply bubble has a dark surface (`bg-paper`) with light text (`text-ink`).

- [ ] **Step 5: Commit**

```bash
git add lib/personas.ts app/chat/\[persona\]/chat-screen.tsx
git commit -m "Fix text-paper color pairings for dark theme"
```

---

### Task 3: Rewrite `app/page.tsx` — remove steps section, condense to one screen, simplify footer

**Files:**
- Modify: `app/page.tsx` (full-file rewrite)

**Interfaces:**
- Consumes: `PERSONA_LIST`, `PERSONAS` from `@/lib/personas` (unchanged shape); `p.theme.hoverBorder`, `p.theme.mist`, `p.theme.action` (unchanged keys, values fixed in Task 2).
- Produces: nothing consumed by other tasks — this is the final task.

- [ ] **Step 1: Replace the full contents of `app/page.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import { PERSONA_LIST, PERSONAS } from "@/lib/personas";

export default function Home() {
  const hitesh = PERSONAS.A;
  const piyush = PERSONAS.B;

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      {/* Soft color washes behind the hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-pine-mist blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-24 -right-28 h-[28rem] w-[28rem] rounded-full bg-ember-mist blur-3xl"
      />

      <header className="relative mx-auto flex w-full max-w-5xl shrink-0 items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex -space-x-1.5">
            <div className="h-7 w-7 overflow-hidden rounded-full ring-2 ring-parchment">
              <Image
                src={hitesh.image}
                alt={hitesh.name}
                width={28}
                height={28}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="h-7 w-7 overflow-hidden rounded-full ring-2 ring-parchment">
              <Image
                src={piyush.image}
                alt={piyush.name}
                width={28}
                height={28}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">
            Duet
          </span>
        </div>
        <a
          href="#personas"
          className="rounded-full border border-line bg-paper px-4 py-2 text-sm font-medium text-ink transition hover:border-ink/30"
        >
          Start a chat
        </a>
      </header>

      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-6 overflow-hidden px-6 py-2">
        <div className="text-center">
          <p className="mb-3 inline-block rounded-full border border-line bg-paper px-3 py-1 text-xs font-medium tracking-wide text-ink-soft uppercase">
            One chatbot · two minds
          </p>
          <h1 className="font-display text-3xl leading-tight font-semibold tracking-tight text-balance md:text-4xl">
            One question, two very different{" "}
            <span className="text-pine">ans</span>
            <span className="text-ember">wers.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-ink-soft">
            Duet gives the same chatbot two temperaments. {hitesh.name} takes
            the long view. {piyush.name} brings the spark. Pick the voice
            that fits your mood and start talking.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#personas"
              className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-parchment transition hover:bg-ink/85"
            >
              Meet the personas
            </a>
            <span className="text-sm text-ink-soft">
              Free to try · no account needed
            </span>
          </div>
        </div>

        <div id="personas" className="grid gap-4 md:grid-cols-2">
          {PERSONA_LIST.map((p) => (
            <Link
              key={p.id}
              href={`/chat/${p.slug}`}
              className={`group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-paper p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(0,0,0,0.55)] ${p.theme.hoverBorder}`}
            >
              <div
                aria-hidden
                className={`absolute -top-16 -right-16 h-40 w-40 rounded-full ${p.theme.mist} blur-2xl opacity-70 transition-opacity group-hover:opacity-100`}
              />
              <div className="relative flex items-center gap-4">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl">
                  <Image
                    src={p.image}
                    alt={p.name}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold">
                    {p.name}
                  </h3>
                  <p className="text-sm text-ink-soft">{p.tagline}</p>
                </div>
              </div>
              <p className="relative mt-3 text-sm leading-relaxed text-ink-soft">
                {p.description}
              </p>
              <div className="relative mt-3 flex flex-wrap gap-2">
                {p.starters.slice(0, 2).map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-line bg-parchment px-3 py-1.5 text-xs text-ink-soft"
                  >
                    &ldquo;{s}&rdquo;
                  </span>
                ))}
              </div>
              <span
                className={`relative mt-4 inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${p.theme.action}`}
              >
                Chat with {p.name}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                >
                  <path d="M13.5 4.5 12 6l4.9 5H3v2h13.9L12 18l1.5 1.5L21 12z" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </main>

      <footer className="relative shrink-0 border-t border-line py-3 text-center text-sm text-ink-soft">
        Made by Pratyaksh Krishnna
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Verify types and lint**

Run: `cd /Users/basantnarayansingh/projects/chatbot && npx tsc --noEmit && npm run lint`
Expected: both commands exit 0 with no errors (in particular, no "unused variable" lint error for the removed `STEPS` array — it no longer exists in the file).

- [ ] **Step 3: Manual visual check**

Run: `npm run dev`, open `http://localhost:3000/` in a browser at a typical laptop viewport (e.g. 1440×900).
Expected:
- The page background, cards, and text are dark (no light-mode colors visible).
- There is no "How it works" section anywhere on the page.
- The page does not scroll vertically (no visible scrollbar on `<body>`/the outer container at this viewport size).
- The footer reads exactly "Made by Pratyaksh Krishnna" and nothing else.
- Both persona cards are visible and clickable, navigating to `/chat/hitesh` and `/chat/piyush` respectively.

If the viewport is short enough that content still overflows, that's a real finding to report back — note the exact viewport height where it starts overflowing rather than silently accepting it.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "Trim homepage to a single non-scrolling screen"
```
