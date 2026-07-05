# PersonaGPT

A Next.js chatbot with two switchable persona modes, backed by the OpenAI Chat Completions API.

## Features

- Landing page introducing both personas — **Hitesh Chaudhary** and **Piyush Garg**, each with their own tagline, description, and starter questions.
- Dedicated chat screen at `/chat/[persona]` — each persona keeps its own conversation thread and system prompt.
- Fully written persona system prompts in [`lib/personas.ts`](lib/personas.ts): identity, tone, knowledge scope, behavior rules, conversation flow, examples, and output-format constraints (20-60 word replies, in-character only).
- Simple server-side API route ([`app/api/chat/route.ts`](app/api/chat/route.ts)) that calls the OpenAI Chat Completions API, so your API key never reaches the browser.
- Custom Tailwind CSS theme (parchment/pine/ember palette) with animated, responsive chat UI.

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

4. Open [http://localhost:3000](http://localhost:3000), pick a persona, and start chatting.

## Customizing the personas

Edit [`lib/personas.ts`](lib/personas.ts) to change a persona's name, tagline, description, starter questions, avatar image, color theme, or `systemPrompt`. Each persona is keyed by a `PersonaId` (`"A"` or `"B"`) and exposes:

```ts
export interface Persona {
  id: PersonaId;
  slug: string;         // used in the /chat/[persona] route
  name: string;
  tagline: string;
  description: string;
  starters: string[];   // suggested starter questions shown on the landing page
  initial: string;
  image: string;
  theme: PersonaTheme;  // Tailwind classes for badges, buttons, accents
  systemPrompt: string;
}
```

The `systemPrompt` is sent as the first message to the model on every request for that persona, so any change to voice, rules, or constraints belongs there.

## Changing the model

The model used for completions is set in [`app/api/chat/route.ts`](app/api/chat/route.ts) (`gpt-4o-mini` by default). Swap it for any chat model your OpenAI account has access to.

## Project structure

```
app/
  page.tsx                    # landing page (persona picker)
  layout.tsx                  # root layout
  globals.css                 # Tailwind + custom theme/animations
  chat/[persona]/page.tsx     # chat route for a given persona slug
  chat/[persona]/chat-screen.tsx  # chat UI (messages, input, typing indicator)
  api/chat/route.ts           # server route that calls the OpenAI API
lib/
  personas.ts                 # persona definitions, themes, and system prompts
```
