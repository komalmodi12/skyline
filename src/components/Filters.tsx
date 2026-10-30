"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useListingsNav } from "./ListingsShell";
import {
  BHK_OPTIONS,
  PRICE_STEPS,
  SORT_LABELS,
  hasActiveFilters,
  priceLabel,
  toQueryString,
  type FilterState,
} from "@/lib/filter-options";

const SEARCH_DELAY_MS = 350;

const fieldClass =
  "h-11 w-full rounded-xl border border-line bg-navy px-3 text-sm text-cream placeholder:text-muted";

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border px-4 text-sm transition-colors ${
        pressed
          ? "border-gold bg-gold font-semibold text-navy"
          : "border-line text-cream hover:border-gold"
      }`}
    >
      {children}
    </button>
  );
}

function PriceSelect({
  id,
  label,
  anyLabel,
  value,
  onChange,
  isDisabled,
}: {
  id: string;
  label: string;
  anyLabel: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  isDisabled: (step: number) => boolean;
}) {
  // Agar URL mein koi alag value hai (jaise minPrice=75), usse bhi option bana do
  const steps =
    value !== undefined && !PRICE_STEPS.includes(value)
      ? [...PRICE_STEPS, value].sort((a, b) => a - b)
      : PRICE_STEPS;

  return (
    <div className="flex-1">
      <label htmlFor={id} className="mb-1 block text-xs text-muted">
        {label}
      </label>
      <select
        id={id}
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? undefined : Number(e.target.value))
        }
        className={fieldClass}
      >
        <option value="">{anyLabel}</option>
        {steps.map((step) => (
          <option key={step} value={step} disabled={isDisabled(step)}>
            {priceLabel(step)}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function Filters({
  state,
  typeOptions,
  sortOptions,
}: {
  state: FilterState;
  typeOptions: readonly string[];
  sortOptions: readonly string[];
}) {
  const { go } = useListingsNav();
  const key = toQueryString(state);

  // draft = panel mein abhi kya dikh raha hai
  // sentKey = last URL jo humne khud bheja
  // seenKey = last URL jo server se aaya
  const [draft, setDraft] = useState<FilterState>(state);
  const [sentKey, setSentKey] = useState(key);
  const [seenKey, setSeenKey] = useState(key);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // URL kisi aur wajah se badla (Back, shared link): panel ko URL ke saath match karo.
  // Agar URL wahi hai jo humne bheja tha, toh draft ko mat chhedo (user abhi type kar raha ho sakta hai).
  if (key !== seenKey) {
    setSeenKey(key);
    if (key !== sentKey) {
      setDraft(state);
      setSentKey(key);
    }
  }

  // Page chhodte waqt pending search ko cancel karo
  useEffect(() => {
    const t = timer;
    return () => {
      if (t.current) clearTimeout(t.current);
    };
  }, []);

  function clearTimer() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }

  function apply(next: FilterState, mode: "push" | "replace" = "push") {
    clearTimer();
    const qs = toQueryString(next);
    setDraft(next);
    setSentKey(qs);
    go(qs, mode);
  }

  function onSearchChange(value: string) {
    const next = { ...draft, q: value };
    setDraft(next);
    clearTimer();
    timer.current = setTimeout(() => {
      const qs = toQueryString(next);
      setSentKey(qs);
      go(qs, "replace");
    }, SEARCH_DELAY_MS);
  }

  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          apply(draft, "replace");
        }}
      >
        <label htmlFor="q" className="mb-1 block text-xs text-muted">
          Search title or locality
        </label>
        <input
          id="q"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          maxLength={100}
          value={draft.q}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="e.g. Powai"
          className={fieldClass}
        />
      </form>

      <fieldset className="mt-5 min-w-0">
        <legend className="mb-2 text-xs text-muted">Price</legend>
        <div className="flex gap-3">
          <PriceSelect
            id="min-price"
            label="Min"
            anyLabel="Any"
            value={draft.minPrice}
            onChange={(v) => apply({ ...draft, minPrice: v })}
            isDisabled={(s) =>
              draft.maxPrice !== undefined && s > draft.maxPrice
            }
          />
          <PriceSelect
            id="max-price"
            label="Max"
            anyLabel="Any"
            value={draft.maxPrice}
            onChange={(v) => apply({ ...draft, maxPrice: v })}
            isDisabled={(s) =>
              draft.minPrice !== undefined && s < draft.minPrice
            }
          />
        </div>
      </fieldset>

      <fieldset className="mt-5 min-w-0">
        <legend className="mb-2 text-xs text-muted">BHK</legend>
        <div className="flex flex-wrap gap-2">
          {BHK_OPTIONS.map((n) => (
            <Chip
              key={n}
              pressed={draft.bhk === n}
              onClick={() =>
                apply({ ...draft, bhk: draft.bhk === n ? undefined : n })
              }
            >
              {n}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-5 min-w-0">
        <legend className="mb-2 text-xs text-muted">Type</legend>
        <div className="flex flex-wrap gap-2">
          {typeOptions.map((t) => (
            <Chip
              key={t}
              pressed={draft.type === t}
              onClick={() =>
                apply({ ...draft, type: draft.type === t ? undefined : t })
              }
            >
              {t}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-5 min-w-0">
        <legend className="mb-2 text-xs text-muted">Furnished</legend>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Yes", value: true },
            { label: "No", value: false },
          ].map((o) => (
            <Chip
              key={o.label}
              pressed={draft.furnished === o.value}
              onClick={() =>
                apply({
                  ...draft,
                  furnished: draft.furnished === o.value ? undefined : o.value,
                })
              }
            >
              {o.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <div className="mt-5">
        <label htmlFor="sort" className="mb-1 block text-xs text-muted">
          Sort by
        </label>
        <select
          id="sort"
          value={draft.sort}
          onChange={(e) => apply({ ...draft, sort: e.target.value })}
          className={fieldClass}
        >
          {sortOptions.map((s) => (
            <option key={s} value={s}>
              {SORT_LABELS[s] ?? s}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters(draft) && (
        <button
          type="button"
          onClick={() => apply({ q: "", sort: "newest" })}
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-gold text-sm font-semibold text-gold transition-colors hover:bg-gold hover:text-navy"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
