import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display mt-2 text-4xl tracking-tight md:text-5xl">{title}</h1>
        {description && (
          <p className="mt-3 text-[var(--text-muted)]">{description}</p>
        )}
      </div>
      {actions}
    </header>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="text-[var(--text-muted)]">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const controlClass =
  "w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--accent-soft)]";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${controlClass} ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${controlClass} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${controlClass} ${props.className ?? ""}`} />;
}

export function PrimaryButton({
  children,
  type = "submit",
  disabled,
}: {
  children: React.ReactNode;
  type?: "submit" | "button";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#06140f] transition hover:bg-[#4aaf8c] disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  type = "submit",
}: {
  children: React.ReactNode;
  type?: "submit" | "button";
}) {
  return (
    <button
      type={type}
      className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-muted)] hover:border-[var(--accent-soft)] hover:text-[var(--text)]"
    >
      {children}
    </button>
  );
}

export function Panel({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`border-t border-[var(--border)] pt-5 ${className ?? ""}`}
    >
      {title && (
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
