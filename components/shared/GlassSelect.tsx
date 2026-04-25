"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GlassSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface GlassSelectProps {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: GlassSelectOption[];
  /** Extra classes applied to the outer wrapper div */
  className?: string;
  disabled?: boolean;
  /** Keeps the orange border permanently (used to signal a pending/unsaved change) */
  highlight?: boolean;
  /** "sm" = compact inline (xs text, amber label), "default" = form-size (sm text, light label) */
  size?: "sm" | "default";
}

export function GlassSelect({
  name,
  value: controlledValue,
  defaultValue = "",
  onChange,
  options,
  className,
  disabled,
  highlight,
  size = "default",
}: GlassSelectProps) {
  const isControlled = controlledValue !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const current = isControlled ? controlledValue : internal;

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOut(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOut);
    return () => document.removeEventListener("mousedown", onOut);
  }, []);

  function pick(val: string) {
    if (!isControlled) setInternal(val);
    onChange?.(val);
    setOpen(false);
  }

  const selected = options.find((o) => o.value === current);
  const isSmall = size === "sm";

  return (
    <div ref={ref} className={cn("relative", className)}>
      {name && <input type="hidden" name={name} value={current} />}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl border bg-[#171A20]/70 transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          isSmall ? "px-2 py-1.5 text-xs text-[#F59E0B]" : "px-3 py-2 text-sm text-[#E7EAF0]",
          open || highlight ? "border-[#F59E0B]" : "border-white/10",
          !disabled && "cursor-pointer",
        )}
      >
        <span className="flex-1 truncate text-left">{selected?.label ?? ""}</span>
        <ChevronDown
          size={isSmall ? 12 : 14}
          className={cn(
            "shrink-0 text-[#A8AFBD] transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-0 right-0 z-30 mt-1 max-h-60 overflow-y-auto rounded-xl border border-[#F59E0B]/15 bg-[#1C1F26]/95 p-1.5 shadow-xl backdrop-blur-xl space-y-0.5">
          {options.map((opt) => {
            const isSel = opt.value === current;
            return (
              <div
                key={opt.value}
                onClick={() => !opt.disabled && pick(opt.value)}
                className={cn(
                  "flex select-none items-center justify-between gap-2 rounded-lg px-3 transition-colors",
                  isSmall ? "py-1.5 text-xs" : "py-2 text-sm",
                  opt.disabled
                    ? "cursor-not-allowed opacity-40 text-[#A8AFBD]"
                    : isSel
                      ? "cursor-pointer bg-[#F59E0B]/15 text-[#F59E0B]"
                      : "cursor-pointer text-[#E7EAF0] hover:bg-[#F59E0B]/10",
                )}
              >
                <span>{opt.label}</span>
                {isSel && !opt.disabled && (
                  <Check size={12} className="shrink-0 text-[#F59E0B]" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
