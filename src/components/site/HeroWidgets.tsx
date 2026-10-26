"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function colomboParts() {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Colombo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    weekday: "short",
  });
  const map: Record<string, string> = {};
  for (const part of formatter.formatToParts(new Date())) {
    if (part.type !== "literal") map[part.type] = part.value;
  }
  return map;
}

/** The three calendar days around today in Colombo time. */
function calendarDays() {
  const parts = colomboParts();
  const today = new Date(`${parts.year}-${parts.month}-${parts.day}T12:00:00Z`);
  return Array.from({ length: 3 }, (_, index) => {
    const day = new Date(today);
    day.setUTCDate(today.getUTCDate() - 1 + index);
    return {
      label: DOW[day.getUTCDay()],
      number: day.getUTCDate(),
      isToday: index === 1,
    };
  });
}

function useColomboTime() {
  const [now, setNow] = useState<{ hours: string; minutes: string; suffix: string; date: string; day: string } | null>(
    null,
  );

  useEffect(() => {
    const tick = () => {
      const parts = colomboParts();
      const hour24 = Number(parts.hour);
      const suffix = hour24 >= 12 ? "pm" : "am";
      const displayHour = hour24 % 12 === 0 ? 12 : hour24 % 12;
      setNow({
        hours: String(displayHour).padStart(2, "0"),
        minutes: parts.minute,
        suffix,
        date: `${parts.year}-${parts.month}-${parts.day}`,
        day: parts.weekday,
      });
    };
    tick();
    const timer = window.setInterval(tick, 20_000);
    return () => window.clearInterval(timer);
  }, []);

  return now;
}

export function HeroWidgets({ formCount, submissionCount }: { formCount: number; submissionCount: number }) {
  const now = useColomboTime();
  const [activeDay, setActiveDay] = useState(1);
  const days = calendarDays();
  const [dock, setDock] = useState(0);

  const hours = now?.hours ?? "10";
  const minutes = now?.minutes ?? "00";
  const suffix = now?.suffix ?? "am";
  const date = now?.date ?? "2026-10-26";

  return (
    <div className="relative mx-auto w-full max-w-[540px] select-none">
      <div className="glow-blob -right-6 top-4 h-40 w-40 bg-ceyteq-300/45" />
      <div className="glow-blob -left-8 bottom-10 h-36 w-36 bg-white/70" />

      <div className="relative grid grid-cols-[1.06fr_1fr] gap-4 sm:gap-5">
        {/* Clock */}
        <div className="flex flex-col justify-center pt-2">
          <div className="font-display text-[68px] font-light leading-[0.86] tracking-[-0.05em] text-navy-700 sm:text-[84px]">
            <div className="flex items-baseline gap-1">
              <span className="tabular-nums">{hours}</span>
              <span className="mb-2 inline-block h-1.5 w-1.5 rounded-full bg-ceyteq-500/70" aria-hidden />
            </div>
            <div className="flex items-baseline">
              <span className="tabular-nums">{minutes}</span>
              <span className="ml-1 font-display text-[16px] font-semibold tracking-normal text-navy-500">
                {suffix}
              </span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <p className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-navy-400">
              Colombo · live
            </p>
          </div>
        </div>

        {/* Assistant card */}
        <div className="neu-raised relative animate-float-slow rounded-[34px] p-3.5 sm:p-4">
          <div className="relative overflow-hidden rounded-[26px] bg-[linear-gradient(160deg,#f7f9fc,#e4e9f1)] px-3 pb-4 pt-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            <div className="mx-auto flex h-[74px] w-full max-w-[168px] flex-col items-center justify-center rounded-[26px] bg-[linear-gradient(160deg,#0d3454,#061d33)] shadow-[inset_0_2px_10px_rgba(255,255,255,0.14),0_10px_24px_-10px_rgba(6,29,51,0.8)]">
              <div className="flex items-center gap-4">
                <span className="h-2.5 w-7 animate-blink rounded-full bg-[#37d6ff] shadow-[0_0_12px_2px_rgba(55,214,255,0.85)]" />
                <span className="h-2 w-7 animate-blink rounded-full bg-[#37d6ff] shadow-[0_0_12px_2px_rgba(55,214,255,0.85)] [animation-delay:0.6s]" />
              </div>
              <span className="mt-2.5 h-1.5 w-3 rounded-full bg-[#37d6ff]/60" />
            </div>
            <p className="mt-3 text-center text-[11px] font-semibold leading-snug text-navy-300">
              Ceyteq AI Concierge
              <br />
              <span className="text-navy-400">{formCount} live forms</span>
            </p>
          </div>
          <span className="absolute -bottom-1.5 left-1/2 flex -translate-x-1/2 gap-6" aria-hidden>
            <span className="h-3 w-7 rounded-full bg-white/70 shadow-[0_4px_8px_rgba(163,177,198,0.6)]" />
            <span className="h-3 w-7 rounded-full bg-white/70 shadow-[0_4px_8px_rgba(163,177,198,0.6)]" />
          </span>
        </div>

        {/* Date card */}
        <div className="neu rounded-[26px] p-3.5">
          <div className="flex items-center justify-between gap-1.5">
            {days.map((day, index) => (
              <button
                key={`${day.label}-${day.number}`}
                type="button"
                onClick={() => setActiveDay(index)}
                aria-pressed={activeDay === index}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-2 transition-all",
                  activeDay === index
                    ? "bg-[linear-gradient(160deg,#123a5c,#082b49)] text-white shadow-[4px_6px_14px_-4px_rgba(8,43,73,0.7)]"
                    : "text-navy-500 hover:bg-white/60",
                )}
              >
                <span
                  className={cn(
                    "text-[9px] font-bold uppercase tracking-[0.12em]",
                    activeDay === index ? "text-ceyteq-200" : "text-navy-300",
                  )}
                >
                  {day.label}
                </span>
                <span className="font-display text-[15px] font-semibold leading-none">
                  {day.number}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-2.5 flex items-center justify-between text-[10.5px] font-semibold text-navy-400">
            <span className="tabular-nums">
              {date.slice(0, 4)} {MONTHS[Number(date.slice(5, 7)) - 1] ?? ""} {date.slice(8, 10)}
            </span>
            <span className="rounded-md bg-white/60 px-1.5 py-0.5 text-navy-300">Kam</span>
          </p>
        </div>

        {/* Live counter pill */}
        <div className="neu-dark flex items-center justify-between rounded-[26px] px-4 py-4 sm:px-5">
          <span className="text-[12.5px] font-semibold italic text-white/90">Submissions</span>
          <span className="flex items-baseline gap-1">
            <span className="font-display text-[27px] font-light leading-none text-[#4fdcff] drop-shadow-[0_0_10px_rgba(79,220,255,0.7)]">
              {submissionCount}
            </span>
            <span className="text-[11px] font-semibold text-white/70">total</span>
          </span>
        </div>

        {/* Vertical capsules */}
        <div className="col-span-2 flex items-center gap-4 sm:gap-6">
          <div className="neu-dark relative h-[126px] w-[46px] overflow-hidden rounded-full">
            <div className="absolute inset-x-[5px] top-[5px] h-[74%] rounded-full bg-[linear-gradient(180deg,#63ddff,#22aee0)] shadow-[inset_0_2px_6px_rgba(255,255,255,0.55)]" />
            <div className="absolute inset-x-0 bottom-3 flex flex-col items-center gap-0.5">
              <span
                className="text-[9.5px] font-semibold italic text-white/90"
                style={{ writingMode: "vertical-rl" }}
              >
                Battery
              </span>
              <span className="text-[10px] font-bold text-white">28%</span>
            </div>
          </div>

          <div className="neu relative h-[126px] w-[46px] overflow-hidden rounded-full">
            <div className="absolute inset-x-0 bottom-0 h-[42%] rounded-b-full bg-[linear-gradient(180deg,#123a5c,#082b49)]" />
            <div className="absolute inset-x-0 bottom-3 flex flex-col items-center gap-0.5 text-white">
              <span
                className="text-[9.5px] font-semibold italic text-white/85"
                style={{ writingMode: "vertical-rl" }}
              >
                Today
              </span>
              <span className="text-[10px] font-bold">58%</span>
            </div>
          </div>

          <div className="flex-1 space-y-2.5">
            <div className="neu flex items-center gap-3 rounded-2xl px-4 py-3">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-navy-700/90 text-white">
                <Icon.forms size={14} />
              </span>
              <span className="text-[12.5px] font-semibold text-navy-500">Dynamic forms</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="neu-orb h-[58px] w-[58px] text-navy-400 transition-transform hover:-translate-y-0.5">
                <Icon.settings size={20} />
              </span>
              <span className="neu-orb h-[58px] w-[58px] text-navy-400 transition-transform hover:-translate-y-0.5">
                <Icon.inbox size={20} />
              </span>
              <Link
                href="/form/restaurant-onboarding"
                className="neu-blue grid h-[58px] flex-1 place-items-center rounded-[20px] text-white"
              >
                <Icon.arrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* Dock */}
        <div className="col-span-2">
          <div className="neu-dark flex items-center justify-between rounded-[26px] px-4 py-3">
            {[
              { key: "forms", icon: "forms" as const, href: "#forms", label: "Forms" },
              { key: "inbox", icon: "inbox" as const, href: "/admin/submissions", label: "Submissions" },
              { key: "palette", icon: "palette" as const, href: "#themes", label: "Themes" },
            ].map((item, index) => {
              const Glyph = Icon[item.icon];
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setDock(index)}
                  aria-label={item.label}
                  aria-pressed={dock === index}
                  className={cn(
                    "grid h-10 w-10 place-items-center rounded-full transition-all",
                    dock === index ? "text-[#46d3ff]" : "text-white/55 hover:text-white/85",
                  )}
                >
                  <Glyph size={20} />
                </button>
              );
            })}
            <Link
              href="/admin/login"
              aria-label="Open dashboard"
              className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-[linear-gradient(150deg,#1b4a6d,#0a2c48)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_16px_-6px_rgba(0,0,0,0.6)] transition-transform hover:-translate-y-0.5"
            >
              <Icon.chart size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
