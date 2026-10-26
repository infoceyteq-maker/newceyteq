"use client";

import { useId } from "react";
import { Icon, PLATFORM_ICONS } from "@/components/icons";
import { NeuSelect } from "@/components/ui/NeuSelect";
import { cn } from "@/lib/utils";
import type { FormFieldDTO, LinkValue, SubmissionValue } from "@/lib/types";

export type FieldRendererProps = {
  field: FormFieldDTO;
  value: SubmissionValue | undefined;
  onChange: (value: SubmissionValue) => void;
  error?: string;
  disabled?: boolean;
};

function ErrorText({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} role="alert" className="mt-2 flex items-center gap-1.5 text-[12.5px] font-semibold text-rose-600">
      <Icon.alert size={14} className="shrink-0" />
      {children}
    </p>
  );
}

function FieldLabel({
  htmlFor,
  field,
  counter,
}: {
  htmlFor: string;
  field: FormFieldDTO;
  counter?: string;
}) {
  return (
    <div className="mb-2 flex items-end justify-between gap-3">
      <label htmlFor={htmlFor} className="text-[12.5px] font-bold uppercase tracking-[0.09em] text-navy-400">
        {field.label}
        {field.required ? (
          <span className="ml-1 text-ceyteq-500" aria-hidden>
            *
          </span>
        ) : (
          <span className="ml-1.5 text-[10px] font-semibold normal-case tracking-normal text-navy-300">
            optional
          </span>
        )}
      </label>
      {counter ? (
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-navy-300">{counter}</span>
      ) : null}
    </div>
  );
}

/* ------------------------------- colour tiles ------------------------------ */

function ColorField({ field, value, onChange, error, disabled }: FieldRendererProps) {
  const id = useId();
  const selected = Array.isArray(value) ? (value as string[]) : [];
  const max = field.config.maxSelections ?? 5;
  const atLimit = selected.length >= max;

  const toggle = (optionValue: string) => {
    if (disabled) return;
    if (selected.includes(optionValue)) {
      onChange(selected.filter((item) => item !== optionValue));
      return;
    }
    if (atLimit) return;
    onChange([...selected, optionValue]);
  };

  return (
    <div>
      <FieldLabel htmlFor={id} field={field} counter={`${selected.length} / ${max} selected`} />
      <div
        id={id}
        role="group"
        aria-label={field.label}
        aria-invalid={!!error || undefined}
        className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5"
      >
        {field.options.map((option) => {
          const checked = selected.includes(option.value);
          const blocked = !checked && atLimit;
          return (
            <button
              key={option.value}
              type="button"
              role="checkbox"
              aria-checked={checked}
              aria-label={option.label}
              disabled={disabled || blocked}
              data-checked={checked}
              onClick={() => toggle(option.value)}
              className={cn("neu-check group flex-col items-start gap-2 p-3", blocked && "opacity-45")}
            >
              <span className="flex w-full items-center justify-between">
                <span
                  className="relative grid h-9 w-9 place-items-center rounded-full ring-1 ring-white/70 transition-transform group-hover:scale-105"
                  style={{
                    background: option.swatch,
                    boxShadow: `inset 0 2px 4px rgba(255,255,255,0.55), inset 0 -4px 8px rgba(0,0,0,0.22), 2px 3px 8px ${option.swatch}66`,
                  }}
                >
                  {checked ? (
                    <Icon.check size={16} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]" />
                  ) : null}
                </span>
                <span
                  className={cn(
                    "grid h-5 w-5 place-items-center rounded-[7px] transition-all",
                    checked ? "bg-ceyteq-500 text-white" : "neu-inset bg-ash-200/60 text-transparent",
                  )}
                  aria-hidden
                >
                  <Icon.check size={12} strokeWidth={3} />
                </span>
              </span>
              <span className="w-full truncate text-[11.5px] font-bold tracking-wide text-navy-500">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
      {field.helpText && !error ? (
        <p className="mt-2 text-[12px] text-navy-300">{field.helpText}</p>
      ) : null}
      {error ? <ErrorText id={`${id}-error`}>{error}</ErrorText> : null}
    </div>
  );
}

/* ------------------------------- links field ------------------------------- */

function LinksField({ field, value, onChange, error, disabled }: FieldRendererProps) {
  const id = useId();
  const rows: LinkValue[] = Array.isArray(value)
    ? (value as LinkValue[]).filter((row) => row && typeof row === "object")
    : [];

  const update = (index: number, patch: Partial<LinkValue>) => {
    const next = rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row));
    onChange(next);
  };

  const addRow = () => {
    const used = new Set(rows.map((row) => row.platform));
    const nextPlatform = field.options.find((option) => !used.has(option.value))?.value ?? "";
    onChange([...rows, { platform: nextPlatform, url: "" }]);
  };

  const removeRow = (index: number) => {
    onChange(rows.filter((_, rowIndex) => rowIndex !== index));
  };

  return (
    <div>
      <FieldLabel htmlFor={`${id}-0`} field={field} counter={`${rows.length} added`} />

      <div className="space-y-2.5">
        {rows.length === 0 ? (
          <div className="neu-sunken grid place-items-center rounded-2xl px-4 py-7 text-center">
            <span className="grid h-11 w-11 place-items-center rounded-2xl text-navy-300">
              <Icon.link size={20} />
            </span>
            <p className="mt-2 text-[13px] font-semibold text-navy-400">
              {field.config.emptyHint || "No links added yet"}
            </p>
            <p className="text-[12px] text-navy-300">Use the button below to add your first link.</p>
          </div>
        ) : null}

        {rows.map((row, index) => (
          <div
            key={`${id}-row-${index}`}
            className="neu group rounded-[22px] p-2.5 sm:p-3"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 sm:w-[220px] sm:shrink-0">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/60 text-ceyteq-500 shadow-neu-inset-sm">
                  {row.platform ? <PlatformGlyph platform={row.platform} /> : <Icon.link size={16} />}
                </span>
                <NeuSelect
                  id={`${id}-${index}`}
                  options={field.options}
                  value={row.platform}
                  onChange={(platform) => update(index, { platform })}
                  placeholder="Platform"
                  ariaLabel={`Platform for link ${index + 1}`}
                  size="sm"
                  invalid={!!error}
                  disabled={disabled}
                  className="min-w-0 flex-1"
                />
              </div>

              <input
                type="url"
                inputMode="url"
                value={row.url}
                disabled={disabled}
                onChange={(event) => update(index, { url: event.target.value })}
                placeholder="https://…"
                aria-label={`URL for link ${index + 1}`}
                className={cn("neu-input flex-1 text-[13.5px]", error && "neu-input-error")}
              />

              <button
                type="button"
                onClick={() => removeRow(index)}
                disabled={disabled}
                aria-label={`Remove link ${index + 1}`}
                className="neu-btn h-11 w-11 shrink-0 self-end !px-0 text-navy-300 hover:!text-rose-500 sm:self-auto"
              >
                <Icon.trash size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={addRow}
          disabled={disabled || rows.length >= 20}
          className="neu-btn group !px-5 !py-2.5 text-[13px]"
        >
          <span className="grid h-5 w-5 place-items-center rounded-full bg-ceyteq-500 text-white shadow-glow transition-transform group-hover:rotate-90">
            <Icon.plus size={12} strokeWidth={3} />
          </span>
          {field.config.addLabel || "+ Add Another Link"}
        </button>
        {rows.length > 0 ? (
          <span className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-navy-300">
            {rows.filter((row) => row.url.trim()).length} ready
          </span>
        ) : null}
      </div>

      {field.helpText && !error ? <p className="mt-2 text-[12px] text-navy-300">{field.helpText}</p> : null}
      {error ? <ErrorText id={`${id}-error`}>{error}</ErrorText> : null}
    </div>
  );
}

function PlatformGlyph({ platform }: { platform: string }) {
  const name = PLATFORM_ICONS[platform] ?? "globe";
  const Glyph = Icon[name];
  return <Glyph size={16} />;
}

/* --------------------------------- main ----------------------------------- */

export function FieldRenderer(props: FieldRendererProps) {
  const { field, value, onChange, error, disabled } = props;
  const id = useId();
  const errorId = `${id}-error`;

  if (field.type === "color-multi") return <ColorField {...props} />;
  if (field.type === "links") return <LinksField {...props} />;

  const stringValue =
    typeof value === "string" ? value : typeof value === "number" ? String(value) : "";
  const describedBy = [error ? errorId : null, field.helpText ? `${id}-help` : null]
    .filter(Boolean)
    .join(" ");

  const shared = {
    id,
    disabled,
    "aria-invalid": !!error || undefined,
    "aria-describedby": describedBy || undefined,
    required: field.required,
    placeholder: field.placeholder || undefined,
    autoComplete: field.config.autoComplete || "off",
    value: stringValue,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(event.target.value),
    className: cn("neu-input", error && "neu-input-error"),
  } as const;

  return (
    <div>
      <FieldLabel
        htmlFor={id}
        field={field}
        counter={
          field.type === "textarea"
            ? `${stringValue.length}${field.config.maxLength ? ` / ${field.config.maxLength}` : ""}`
            : undefined
        }
      />

      {field.type === "textarea" ? (
        <textarea {...shared} rows={4} className={cn(shared.className, "min-h-[112px] resize-y leading-relaxed")} />
      ) : field.type === "select" ? (
        <NeuSelect
          id={id}
          options={field.options}
          value={stringValue}
          onChange={(next) => onChange(next)}
          placeholder={field.placeholder || "Select an option"}
          ariaLabel={field.label}
          invalid={!!error}
          disabled={disabled}
        />
      ) : (
        <div className="relative">
          <input
            {...shared}
            type={field.type === "number" ? "text" : field.type}
            inputMode={
              field.type === "tel" ? "tel" : field.type === "number" ? "decimal" : field.type === "email" ? "email" : field.type === "url" ? "url" : undefined
            }
            className={cn(shared.className, field.type === "url" && "pr-11")}
          />
          {field.type === "url" ? (
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-300">
              <Icon.link size={16} />
            </span>
          ) : null}
        </div>
      )}

      {field.helpText && !error ? (
        <p id={`${id}-help`} className="mt-2 text-[12px] text-navy-300">
          {field.helpText}
        </p>
      ) : null}
      {error ? <ErrorText id={errorId}>{error}</ErrorText> : null}
    </div>
  );
}
