"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Persona, PERSONA_LIST } from "@/lib/personas";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function PersonaAvatar({
  persona,
  size,
  rounded = "full",
}: {
  persona: Persona;
  size: number;
  rounded?: "full" | "2xl" | "3xl";
}) {
  const roundedClass =
    rounded === "full"
      ? "rounded-full"
      : rounded === "2xl"
        ? "rounded-2xl"
        : "rounded-3xl";
  return (
    <div
      className={`shrink-0 overflow-hidden ${roundedClass}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={persona.image}
        alt={persona.name}
        width={size}
        height={size}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export default function ChatScreen({ persona }: { persona: Persona }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const storageKey = `duet-chat:${persona.slug}`;
  const otherPersona = PERSONA_LIST.find((p) => p.id !== persona.id);

  // Restore this persona's thread for the current browser session. This must
  // happen after hydration (not in a lazy initializer) because the page is
  // prerendered without access to sessionStorage.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setMessages(JSON.parse(raw));
    } catch {
      // Corrupt or unavailable storage — start fresh.
    }
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // Storage full or unavailable — chat still works in memory.
    }
  }, [messages, hydrated, storageKey]);

  // Keep the chat window scrolled to the latest message.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMessage: ChatMessage = {
      id: makeId(),
      role: "user",
      content: trimmed,
    };
    const historyForRequest = [...messages, userMessage];

    setMessages(historyForRequest);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId: persona.id,
          messages: historyForRequest.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      const assistantMessage: ChatMessage = {
        id: makeId(),
        role: "assistant",
        content: data.reply || "(empty response)",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send message.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function clearConversation() {
    if (loading) return;
    setMessages([]);
    setError("");
  }

  return (
    <div className="flex h-dvh flex-col">
      {/* Header */}
      <header className="shrink-0 border-b border-line bg-paper/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/"
            aria-label="Back to home"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-ink-soft transition hover:border-ink/30 hover:text-ink"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M10.5 19.5 12 18l-4.9-5H21v-2H7.1L12 6l-1.5-1.5L3 12z" />
            </svg>
          </Link>
          <PersonaAvatar persona={persona} size={40} rounded="2xl" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-lg font-semibold leading-tight">
              {persona.name}
            </h1>
            <p className="truncate text-xs text-ink-soft">{persona.tagline}</p>
          </div>
          {otherPersona && (
            <Link
              href={`/chat/${otherPersona.slug}`}
              className="hidden rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-ink/30 hover:text-ink sm:block"
            >
              Talk to {otherPersona.name} instead
            </Link>
          )}
          <button
            onClick={clearConversation}
            disabled={loading || messages.length === 0}
            className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-ink/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
          >
            Clear
          </button>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6 sm:px-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center gap-5 py-16 text-center">
              <PersonaAvatar persona={persona} size={72} rounded="3xl" />
              <div>
                <p className="font-display text-xl font-semibold">
                  Say hello to {persona.name}
                </p>
                <p className="mt-1 max-w-sm text-sm text-ink-soft">
                  {persona.description}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {persona.starters.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    disabled={loading}
                    className="rounded-full border border-line bg-paper px-4 py-2 text-sm text-ink-soft transition hover:border-ink/30 hover:text-ink disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`animate-message-in flex items-end gap-2 ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.role === "assistant" && (
                <PersonaAvatar persona={persona} size={32} rounded="full" />
              )}
              <div
                className={`max-w-[75%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "rounded-br-sm bg-ink text-parchment"
                    : "rounded-bl-sm border border-line bg-paper text-ink"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex animate-message-in items-end gap-2">
              <PersonaAvatar persona={persona} size={32} rounded="full" />
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-line bg-paper px-4 py-3">
                <span className="h-1.5 w-1.5 animate-bounce-dot rounded-full bg-ink-soft [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce-dot rounded-full bg-ink-soft [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce-dot rounded-full bg-ink-soft [animation-delay:300ms]" />
              </div>
            </div>
          )}

          {error && (
            <div className="animate-message-in self-center rounded-xl border border-ember/40 bg-ember-mist px-4 py-2 text-xs text-ember-deep">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-line bg-paper/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-3xl items-end gap-2 px-4 py-4 sm:px-6">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${persona.name}...`}
            rows={1}
            disabled={loading}
            className="max-h-32 flex-1 resize-none rounded-2xl border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-ink/30 disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition disabled:cursor-not-allowed disabled:opacity-30 ${persona.theme.action}`}
            aria-label="Send message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M3.4 20.6 21 12 3.4 3.4l-.02 6.4L15 12l-11.62 2.2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
