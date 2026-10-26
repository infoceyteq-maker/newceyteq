import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/icons";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/admin");

  return (
    <div className="relative grid min-h-screen place-items-center bg-ash-300 px-4 py-10">
      <div className="glow-blob left-[10%] top-[8%] h-72 w-72 bg-ash-50" />
      <div className="glow-blob bottom-[6%] right-[8%] h-64 w-64 bg-ash-100" />

      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-[36px] lg:grid-cols-[1fr_0.85fr]">
        {/* Form panel */}
        <div className="neu-raised relative z-10 rounded-[36px] p-7 sm:p-10">
          <Logo height={40} priority />
          <h1 className="mt-8 text-[27px] font-semibold leading-tight text-navy-700 sm:text-[32px]">
            Welcome back to the
            <br />
            <span className="text-gradient-blue">Digital Race</span>
          </h1>
          <p className="mt-3 max-w-sm text-[13.5px] leading-relaxed text-navy-400">
            Sign in to build forms, publish links and review restaurant submissions.
          </p>

          <Suspense fallback={<div className="mt-8 h-64 animate-pulse rounded-2xl bg-ash-100/80" />}>
            <LoginForm />
          </Suspense>

          <div className="mt-7 flex items-center justify-between text-[11.5px] font-semibold text-navy-300">
            <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-ceyteq-500">
              <Icon.arrowLeft size={13} />
              Back to site
            </Link>
            <span className="flex items-center gap-1.5">
              <Icon.shield size={13} />
              Session secured by HttpOnly cookie
            </span>
          </div>
        </div>

        {/* Visual panel */}
        <div className="neu-dark relative hidden flex-col justify-between overflow-hidden rounded-r-[36px] p-8 lg:flex">
          <div className="glow-blob -right-10 top-10 h-40 w-40 bg-ceyteq-neon/30" />
          <div className="relative">
            <span className="neu-badge bg-white/10 text-ceyteq-neon text-glow-neon">
              <Icon.bolt size={12} />
              Platform console
            </span>
            <p className="mt-5 font-display text-[24px] font-semibold leading-snug text-white">
              Build a form,
              <br />
              publish a link,
              <br />
              launch a brand.
            </p>
          </div>

          <div className="relative space-y-2.5">
            {[
              { label: "Dynamic form builder", icon: "layers" as const },
              { label: "Public slug per form", icon: "link" as const },
              { label: "Validated submissions", icon: "shield" as const },
            ].map((item) => {
              const Glyph = Icon[item.icon];
              return (
                <div
                  key={item.label}
                  className="neu-dark-inset flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
                >
                  <Glyph size={15} className="text-ceyteq-neon drop-shadow-[0_0_8px_rgba(0, 210, 255,0.85)]" />
                  <span className="text-[12px] font-semibold text-white/85">{item.label}</span>
                </div>
              );
            })}
          </div>

          <p className="relative text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/50">
            Empowering Digital Evolution
          </p>
        </div>
      </div>
    </div>
  );
}
