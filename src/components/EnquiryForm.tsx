"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { todayInIST } from "@/lib/date";

type FieldName = "name" | "phone" | "email" | "message" | "visitDate";
type Status = "idle" | "sending" | "success";
type Errors = Partial<Record<FieldName, string>>;

const EMPTY = { name: "", phone: "", email: "", message: "", visitDate: "" };
const FIELD_ORDER: FieldName[] = [
  "name",
  "phone",
  "email",
  "message",
  "visitDate",
];

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-xs text-red-300">
      {message}
    </p>
  );
}

export default function EnquiryForm({ propertySlug }: { propertySlug: string }) {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);
  const preloaded = useRef(false);

  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [submitted, setSubmitted] = useState<{
    name: string;
    phone: string;
    visitDate: string;
  } | null>(null);

  // Aaj se pehle ki date picker mein na chuni ja sake
  useEffect(() => {
    dateRef.current?.setAttribute("min", todayInIST());
  }, []);

  // Success par focus us message par jaata hai, taaki screen reader use padh le
  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  // Schema (aur zod) pehli baar form chhoone par load hota hai
  function preload() {
    if (preloaded.current) return;
    preloaded.current = true;
    void import("@/lib/enquiry");
  }

  function setValue(name: FieldName, raw: string) {
    const value = name === "phone" ? raw.replace(/\D/g, "").slice(0, 10) : raw;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[name];
        return next;
      });
    }
  }

  function focusFirst(found: Errors) {
    const first = FIELD_ORDER.find((n) => found[n]);
    if (first) {
      formRef.current
        ?.querySelector<HTMLElement>(`[name="${first}"]`)
        ?.focus();
    }
  }

  function common(name: FieldName) {
    const hasError = Boolean(errors[name]);
    return {
      id: `${uid}-${name}`,
      name,
      value: values[name],
      onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setValue(name, e.target.value),
      "aria-invalid": hasError ? true : undefined,
      "aria-describedby": hasError ? `${uid}-${name}-error` : undefined,
      className: `w-full rounded-xl border bg-navy px-3 text-sm text-cream placeholder:text-muted ${
        hasError ? "border-red-400" : "border-line"
      }`,
    };
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sendingRef.current) return; // double submit roko
    sendingRef.current = true;

    const website = String(
      new FormData(event.currentTarget).get("website") ?? ""
    );
    setStatus("sending");
    setFormError(null);

    try {
      const { EnquirySchema, toFieldErrors } = await import("@/lib/enquiry");
      const payload = { ...values, propertySlug, website };

      // Client par wahi rules jo server par hain
      const parsed = EnquirySchema.safeParse(payload);
      if (!parsed.success) {
        const found = toFieldErrors(parsed.error) as Errors;
        setErrors(found);
        setStatus("idle");
        focusFirst(found);
        return;
      }
      setErrors({});

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      let res: Response;
      try {
        res = await fetch("/api/enquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      if (res.status === 201) {
        setSubmitted({
          name: values.name.trim(),
          phone: values.phone,
          visitDate: values.visitDate,
        });
        setValues(EMPTY);
        setStatus("success");
        return;
      }

      const data = (await res.json().catch(() => null)) as {
        error?: string;
        fieldErrors?: Record<string, string>;
      } | null;

      if (res.status === 429) {
        const secs = Number(res.headers.get("Retry-After")) || 600;
        const mins = Math.max(1, Math.ceil(secs / 60));
        setFormError(
          `You have sent too many enquiries. Please try again in about ${mins} ${
            mins === 1 ? "minute" : "minutes"
          }. Your details are still here.`
        );
      } else if (res.status === 400 && data?.fieldErrors) {
        const found: Errors = {};
        for (const [key, message] of Object.entries(data.fieldErrors)) {
          if ((FIELD_ORDER as string[]).includes(key)) {
            found[key as FieldName] = message;
          }
        }
        setErrors(found);
        if (Object.keys(found).length > 0) {
          focusFirst(found);
        } else {
          setFormError("Please check your details and try again.");
        }
      } else {
        setFormError(
          `${data?.error ?? "Something went wrong."} Your details are still here, please try again.`
        );
      }
      setStatus("idle");
    } catch {
      setFormError(
        "Could not reach the server. Check your connection and try again. Your details are still here."
      );
      setStatus("idle");
    } finally {
      sendingRef.current = false;
    }
  }

  if (status === "success" && submitted) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="rounded-2xl border border-gold/50 bg-card p-6 outline-none"
      >
        <h2 className="font-serif text-2xl">Thank you, {submitted.name}</h2>
        <p className="mt-2 text-sm text-muted">
          We received your enquiry. Our team will call {submitted.phone} to
          confirm your visit on {formatDate(submitted.visitDate)}.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(null);
            setStatus("idle");
          }}
          className="mt-5 inline-flex min-h-11 items-center rounded-full border border-gold px-5 text-sm font-semibold text-gold transition-colors hover:bg-gold hover:text-navy"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  const label = "mb-1 block text-xs text-muted";

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      onFocus={preload}
      noValidate
      aria-busy={status === "sending"}
      className="relative rounded-2xl border border-line bg-card p-6"
    >
      <h2 className="font-serif text-2xl">Book a visit</h2>
      <p className="mt-2 text-sm text-muted">
        Tell us when you would like to visit. All fields except email are
        required.
      </p>

      {/* Honeypot: insaan ko dikhta nahi, bot bhar deta hai */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <label>
          Leave this field empty
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div className="mt-5">
        <label htmlFor={`${uid}-name`} className={label}>
          Name
        </label>
        <input
          {...common("name")}
          type="text"
          autoComplete="name"
          maxLength={80}
          className={`${common("name").className} h-11`}
        />
        <FieldError id={`${uid}-name-error`} message={errors.name} />
      </div>

      <div className="mt-4">
        <label htmlFor={`${uid}-phone`} className={label}>
          Mobile number
        </label>
        <input
          {...common("phone")}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={10}
          placeholder="10-digit number"
          className={`${common("phone").className} h-11`}
        />
        <FieldError id={`${uid}-phone-error`} message={errors.phone} />
      </div>

      <div className="mt-4">
        <label htmlFor={`${uid}-email`} className={label}>
          Email (optional)
        </label>
        <input
          {...common("email")}
          type="email"
          inputMode="email"
          autoComplete="email"
          className={`${common("email").className} h-11`}
        />
        <FieldError id={`${uid}-email-error`} message={errors.email} />
      </div>

      <div className="mt-4">
        <label htmlFor={`${uid}-visitDate`} className={label}>
          Preferred visit date
        </label>
        <input
          {...common("visitDate")}
          ref={dateRef}
          type="date"
          className={`${common("visitDate").className} h-11`}
        />
        <FieldError id={`${uid}-visitDate-error`} message={errors.visitDate} />
      </div>

      <div className="mt-4">
        <label htmlFor={`${uid}-message`} className={label}>
          Message
        </label>
        <textarea
          {...common("message")}
          rows={4}
          maxLength={1000}
          className={`${common("message").className} min-h-28 py-2`}
        />
        <FieldError id={`${uid}-message-error`} message={errors.message} />
      </div>

      {formError && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-400/50 bg-red-950/30 px-4 py-3 text-sm text-red-200"
        >
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-gold px-6 text-sm font-semibold text-navy transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {status === "sending" ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
