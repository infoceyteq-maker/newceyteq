"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { FieldOption } from "@/lib/types";

type NeuSelectProps = {
  options: FieldOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel: string;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
  id?: string;
};

/**
 * A neumorphic listbox. Native <select> popovers cannot be styled, so the
 * platform picker uses a custom button + popover with keyboard support.
 */
export function NeuSelect({
  options,
  value,
  onChange,
  placeholder = "Select",
  ariaLabel,
  invalid,
  disabled,
  className,
  size = "md",
  id,
}: NeuSelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      const index = options.findIndex((option) => option.value === value);
      setActiveIndex(index >= 0 ? index : 0);
    }
  }, [open, options, value]);

  const commit = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        id={id}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
          if (open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
            event.preventDefault();
            const delta = event.key === "ArrowDown" ? 1 : -1;
            setActiveIndex((prev) => (prev + delta + options.length) % options.length);
          }
          if (open && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            commit(activeIndex);
          }
        }}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-2xl text-left font-semibold transition-all duration-200",
          size === "sm" ? "px-3.5 py-3 text-[13.5px]" : "px-4 py-3.5 text-[14.5px]",
          "neu-input",
          open && "ring-2 ring-ceyteq-500/20",
          invalid && "neu-input-error",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <span className={cn("flex min-w-0 items-center gap-2", !selected && "text-navy-300")}>
          {selected?.swatch ? (
            <span
              className="h-4 w-4 shrink-0 rounded-full shadow-inner"
              style={{ background: selected.swatch }}
            />
          ) : null}
          <span className="truncate">{selected?.label ?? placeholder}</span>
        </span>
        <Icon.chevron
          size={16}
          className={cn("shrink-0 text-navy-300 transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 right-0 top-[calc(100%+10px)] z-40 max-h-64 overflow-auto rounded-2xl border border-white/75 bg-[linear-gradient(150deg,#fbfdff,#e9eff7)] p-2 shadow-[-10px_-10px_24px_rgba(255,255,255,0.95),14px_14px_32px_rgba(23,43,77,0.18)]"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => commit(index)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13.5px] font-medium transition-colors",
                    index === activeIndex ? "bg-white/70 text-navy-700" : "text-navy-400",
                    isSelected && "text-ceyteq-600 font-semibold",
                  )}
                >
                  {option.swatch ? (
                    <span
                      className="h-3.5 w-3.5 shrink-0 rounded-full shadow-inner ring-1 ring-white/60"
                      style={{ background: option.swatch }}
                    />
                  ) : null}
                  <span className="flex-1 truncate">{option.label}</span>
                  {isSelected ? <Icon.check size={15} className="text-ceyteq-500" /> : null}
                </button>
              </li>
            );
          })}
          {options.length === 0 ? (
            <li className="px-3 py-2 text-[13px] text-navy-300">No options configured</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
