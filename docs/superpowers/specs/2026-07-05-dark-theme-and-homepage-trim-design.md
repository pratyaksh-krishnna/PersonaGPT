# Dark theme + homepage trim

## Goal

1. Convert the frontend to a single, permanent dark theme (no toggle, no `prefers-color-scheme` — always dark).
2. Trim `app/page.tsx` into a single, non-scrolling screen: drop the "How it works" section and the hero mock chat exchange, and replace the footer with one credit line.

## 1. Dark theme

The palette is centralized as named Tailwind v4 tokens in the `@theme` block of `app/globals.css` (`parchment`, `paper`, `ink`, `ink-soft`, `line`, `pine`, `pine-deep`, `pine-mist`, `ember`, `ember-deep`, `ember-mist`) and consumed everywhere via utility classes (`bg-paper`, `text-ink-soft`, `border-line`, etc.). The approach is to redefine the token *values* to dark equivalents rather than touch every call site.

Target values:

| Token | Old (light) | New (dark) | Role |
|---|---|---|---|
| `parchment` | `#f4efe4` | `#17140f` | page background |
| `paper` | `#fffdf6` | `#221e19` | elevated surface (cards, header/input bars) |
| `ink` | `#26201a` | `#f3ece0` | primary text; also solid light-chip background (see pairing fix below) |
| `ink-soft` | `#6f6355` | `#a89985` | secondary/muted text |
| `line` | `#e2d9c6` | `#3a352c` | borders |
| `pine` | `#33604a` | `#3f8f68` | accent (badges/buttons/headline), tuned for contrast against both dark bg and white text |
| `pine-deep` | `#24493a` | `#5cae87` | hover state — brighter on hover (idiomatic for dark UI) |
| `pine-mist` | `#dfe8dc` | `#1c3a2c` | decorative blur glow only (no text sits on it) |
| `ember` | `#bc5127` | `#c1512e` | accent (badges/buttons/headline) |
| `ember-deep` | `#9c3f1c` | `#e2774a` | hover state + text color on `ember-mist` banner |
| `ember-mist` | `#f6e0d0` | `#3a2015` | decorative blur glow + error banner background |

### Pairing fixes (unavoidable class-level edits)

`ink` and `paper` swap from dark/light to light/dark. Two places pair a token as background with itself as foreground text, which breaks under the new values:

- `bg-ink ... text-paper` (primary CTA button in `page.tsx`, both user chat bubbles in `page.tsx` and `chat-screen.tsx`) → change `text-paper` to `text-parchment`. `ink` is now light, so it needs a dark foreground; `parchment` is the darkest token in the new palette.
- `bg-pine text-paper` / `bg-ember text-paper` (persona `badge` and `action` theme strings in `lib/personas.ts`) → change `text-paper` to `text-white`. These fills stay mid-dark, so plain white text still has good contrast.

### Other touch-ups

- `app/globals.css` scrollbar-thumb color (`rgba(111, 99, 85, 0.35)`) → lighten to something visible against the new dark track, e.g. `rgba(200, 190, 172, 0.3)`.
- Add `color-scheme: dark` to the `body` rule so native form controls/scrollbars render dark.
- `app/page.tsx` has two hardcoded shadow colors tuned for a light backdrop (`rgba(38,32,26,...)`) on the hero mock card and persona cards. Convert to black-based shadows (`rgba(0,0,0,...)`, same alpha) so elevation still reads on a dark page. (The hero mock card itself is being removed per section 2, so only the persona-card shadow survives.)

No other files need class-level changes — `bg-paper`, `text-ink`, `text-ink-soft`, `border-line`, `ring-parchment`, `bg-parchment`, and the `mist`/`hoverBorder` theme fields all keep working once the underlying values are dark.

## 2. Homepage trim (`app/page.tsx`)

- Remove the `STEPS` array and the entire "How it works" `<section>`.
- Remove the hero mock chat exchange block (the rotated card showing a sample question + two persona replies).
- Shrink hero copy/spacing as needed so the hero + persona-picker section fit in one viewport without scrolling.
- Change the outer container from `min-h-dvh overflow-x-clip` to `h-dvh overflow-hidden` (or equivalent) so the page cannot scroll.
- Replace the current footer (logo mark + tagline) with a single centered line: **"Made by Pratyaksh Krishnna"** (spelling confirmed by user, kept as typed).

Out of scope: `app/chat/[persona]/chat-screen.tsx` layout/behavior beyond the one `text-paper` → `text-parchment` color fix; no changes to `lib/personas.ts` content beyond the color-token fix; no dark/light toggle or system-preference detection.
