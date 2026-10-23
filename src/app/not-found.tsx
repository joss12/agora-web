import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-5 py-20">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
          <SearchX
            size={30}
            strokeWidth={1.5}
            className="text-zinc-700"
          />
        </div>

        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">
          Error 404
        </p>

        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
          Lost your way?
        </h1>

        <p className="mx-auto mt-5 max-w-sm text-sm leading-7 text-zinc-500">
          We couldn&apos;t find the page you&apos;re
          looking for. It may have been moved, removed,
          or never existed.
        </p>

        <Link
          href="/"
          className="mt-9 inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          <ArrowLeft size={16} />
          Back to shop
        </Link>

        <p className="mt-10 text-xs text-zinc-400">
          There&apos;s always something new to discover at Agora.
        </p>
      </div>
    </main>
  );
}
