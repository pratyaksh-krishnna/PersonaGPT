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

      <header className="relative mx-auto flex w-full max-w-5xl shrink-0 items-center justify-center px-6 py-5">
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
          <span className="font-display text-4xl font-semibold tracking-tight">
            Persona<span className="text-ember">GPT</span>
          </span>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col justify-start gap-8 overflow-hidden px-6 py-6">
        <div className="text-center">
          <p className="-mt-2 mb-4 inline-block rounded-full border border-line bg-paper px-3 py-1 text-xs font-medium tracking-wide text-ink-soft uppercase">
            One chatbot · two minds
          </p>
          <h1 className="font-display text-4xl leading-tight font-semibold tracking-tight text-balance md:text-5xl">
            One question, two very different{" "}
            <span className="text-pine">ans</span>
            <span className="text-ember">wers.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">
            Duet gives the same chatbot two temperaments. {hitesh.name} takes
            the long view. {piyush.name} brings the spark. Pick the voice
            that fits your mood and start talking.
          </p>
        </div>

        <div id="personas" className="grid gap-6 md:grid-cols-2">
          {PERSONA_LIST.map((p) => (
            <Link
              key={p.id}
              href={`/chat/${p.slug}`}
              className={`group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-paper p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(0,0,0,0.55)] ${p.theme.hoverBorder}`}
            >
              <div
                aria-hidden
                className={`absolute -top-16 -right-16 h-40 w-40 rounded-full ${p.theme.mist} blur-2xl opacity-70 transition-opacity group-hover:opacity-100`}
              />
              <div className="relative flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
                  <Image
                    src={p.image}
                    alt={p.name}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-semibold">
                    {p.name}
                  </h3>
                  <p className="text-base text-ink-soft">{p.tagline}</p>
                </div>
              </div>
              <p className="relative mt-4 text-base leading-relaxed text-ink-soft">
                {p.description}
              </p>
              <div className="relative mt-4 flex flex-wrap gap-2">
                {p.starters.slice(0, 2).map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-line bg-parchment px-3 py-1.5 text-sm text-ink-soft"
                  >
                    &ldquo;{s}&rdquo;
                  </span>
                ))}
              </div>
              <span
                className={`relative mt-6 inline-flex w-fit items-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition ${p.theme.action}`}
              >
                Chat with {p.name}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
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
