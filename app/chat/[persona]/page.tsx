import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPersonaBySlug, PERSONA_LIST } from "@/lib/personas";
import ChatScreen from "./chat-screen";

interface ChatPageProps {
  params: Promise<{ persona: string }>;
}

export function generateStaticParams() {
  return PERSONA_LIST.map((p) => ({ persona: p.slug }));
}

export async function generateMetadata({
  params,
}: ChatPageProps): Promise<Metadata> {
  const { persona } = await params;
  const match = getPersonaBySlug(persona);
  if (!match) return { title: "PersonaGPT" };
  return {
    title: `Chat with ${match.name} — PersonaGPT`,
    description: `${match.name}: ${match.tagline}.`,
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { persona } = await params;
  const match = getPersonaBySlug(persona);
  if (!match) notFound();

  return <ChatScreen persona={match} />;
}
