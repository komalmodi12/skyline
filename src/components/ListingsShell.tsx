"use client";

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

type Mode = "push" | "replace";

interface ListingsNav {
  go: (query: string, mode?: Mode) => void;
}

const NavContext = createContext<ListingsNav | null>(null);

export function useListingsNav() {
  const value = useContext(NavContext);
  if (!value) {
    throw new Error("useListingsNav must be used inside ListingsShell");
  }
  return value;
}

export default function ListingsShell({
  filters,
  children,
}: {
  filters: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const go = useCallback(
    (query: string, mode: Mode = "push") => {
      startTransition(() => {
        const url = `${pathname}${query}`;
        if (mode === "replace") router.replace(url, { scroll: false });
        else router.push(url, { scroll: false });
      });
    },
    [pathname, router]
  );

  const value = useMemo(() => ({ go }), [go]);

  return (
    <NavContext.Provider value={value}>
      <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
        <div>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-gold px-5 text-sm font-semibold text-gold lg:hidden"
          >
            {open ? "Hide filters" : "Show filters"}
          </button>
          <div
            id={panelId}
            className={`${open ? "mt-4 block" : "hidden"} lg:sticky lg:top-24 lg:mt-0 lg:block`}
          >
            {filters}
          </div>
        </div>
        <section
          aria-busy={pending}
          className={`min-w-0 transition-opacity duration-200 ${
            pending ? "opacity-50" : "opacity-100"
          }`}
        >
          {children}
        </section>
      </div>
    </NavContext.Provider>
  );
}
