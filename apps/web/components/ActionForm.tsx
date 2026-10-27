"use client";

import { useState, useTransition } from "react";
import type { ActionResult } from "@/lib/actions";

function isNextRedirect(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { digest?: string; message?: string };
  if (typeof e.digest === "string" && e.digest.startsWith("NEXT_REDIRECT")) return true;
  if (typeof e.message === "string" && e.message.includes("NEXT_REDIRECT")) return true;
  return false;
}

export function ActionForm({
  action,
  children,
  className,
  onSuccess,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
  className?: string;
  onSuccess?: (result: Extract<ActionResult, { ok: true }>) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        setError(null);
        startTransition(async () => {
          try {
            const result = await action(fd);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            onSuccess?.(result);
            form.reset();
          } catch (err) {
            if (isNextRedirect(err)) throw err;
            setError(err instanceof Error ? err.message : "Something went wrong");
          }
        });
      }}
    >
      {children}
      {error && (
        <p className="mt-3 text-sm text-[#e8a0a0]" role="alert">
          {error}
        </p>
      )}
      {pending && (
        <p className="mt-2 text-xs text-[var(--text-muted)]">Saving…</p>
      )}
    </form>
  );
}
