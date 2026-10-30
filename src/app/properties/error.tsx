"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";

export default function ListingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  function retry() {
    // refresh() server se naya data mangta hai, reset() error screen hatata hai
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-[5vw] py-16">
      <div
        role="alert"
        className="rounded-2xl border border-line bg-card px-6 py-16 text-center"
      >
        <h1 className="font-serif text-3xl">Something went wrong</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          We could not load this page. Please try again.
        </p>
        <button
          type="button"
          onClick={retry}
          className="mt-6 inline-flex min-h-11 items-center rounded-full bg-gold px-6 text-sm font-semibold text-navy transition hover:-translate-y-0.5"
        >
          Try again
        </button>
        {error.digest && (
          <p className="mt-6 text-xs text-muted">Reference: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
