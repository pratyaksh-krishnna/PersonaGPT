import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { PERSONAS, PersonaId } from "@/lib/personas";

export const runtime = "nodejs";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  let body: { messages?: ChatMessage[]; personaId?: PersonaId };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const messages = body.messages;
  const personaId = body.personaId;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "'messages' must be a non-empty array." },
      { status: 400 }
    );
  }

  if (personaId !== "A" && personaId !== "B") {
    return NextResponse.json(
      { error: "'personaId' must be 'A' or 'B'." },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing OPENAI_API_KEY. Add it to .env.local." },
      { status: 500 }
    );
  }

  const persona = PERSONAS[personaId];

  // Build the payload for OpenAI: persona system prompt first, then the
  // running conversation history sent up from the client.
  const openaiMessages: { role: "system" | "user" | "assistant"; content: string }[] = [];
  openaiMessages.push({ role: "system", content: persona.systemPrompt });

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (!msg || typeof msg.content !== "string") continue;
    if (msg.role !== "user" && msg.role !== "assistant") continue;
    openaiMessages.push({ role: msg.role, content: msg.content });
  }

  const client = new OpenAI({ apiKey });

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: openaiMessages,
      temperature: 0.8,
    });

    const reply = completion.choices[0]?.message?.content ?? "";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("OpenAI request failed:", err);
    const message =
      err instanceof Error ? err.message : "Failed to reach OpenAI API.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
