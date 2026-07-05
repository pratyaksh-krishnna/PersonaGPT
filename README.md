# Persona Chat

A Next.js chatbot with two switchable persona modes, backed by the OpenAI Chat Completions API.

## Features

- Two persona modes (**Persona A** / **Persona B**) toggled from the header — each keeps its own conversation thread.
- Both personas' system prompts are intentionally left **blank** in [`lib/personas.ts`](lib/personas.ts) — fill them in to give each persona its own personality/behavior.
- Attractive, animated chat UI built with Tailwind CSS (gradients, message bubbles, typing indicator, auto-scroll).
- Simple server-side API route ([`app/api/chat/route.ts`](app/api/chat/route.ts)) that calls the OpenAI GPT API, so your API key never reaches the browser.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Add your OpenAI API key:

   ```bash
   cp .env.example .env.local
   # then edit .env.local and set OPENAI_API_KEY=sk-...
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Customizing the personas

Edit [`lib/personas.ts`](lib/personas.ts) to set each persona's name, tagline, avatar, color accent, and — most importantly — its `systemPrompt`:

```ts
export const PERSONAS: Record<PersonaId, Persona> = {
  A: {
    id: "A",
    name: "Persona A",
    tagline: "Mode one",
    avatar: "🅰️",
    accent: "from-violet-500 to-fuchsia-500",
    gradient: "from-violet-500/20 via-fuchsia-500/10 to-transparent",
    systemPrompt: "", // <- put Persona A's behavior/instructions here
  },
  B: {
    id: "B",
    name: "Persona B",
    tagline: "Mode two",
    avatar: "🅱️",
    accent: "from-cyan-500 to-blue-500",
    gradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
    systemPrompt: "", // <- put Persona B's behavior/instructions here
  },
};
```

The system prompt is sent as the first message to the model on every request for that persona.

## Changing the model

The model used for completions is set in [`app/api/chat/route.ts`](app/api/chat/route.ts) (`gpt-4o-mini` by default). Swap it for any chat model your OpenAI account has access to.

## Project structure

```
app/
  api/chat/route.ts   # server route that calls the OpenAI API
  page.tsx            # chat UI (persona toggle, messages, input)
  layout.tsx          # root layout
  globals.css         # Tailwind + custom animations
lib/
  personas.ts         # persona definitions (system prompts left blank)
```
