"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";

export function LoginForm({ demoEmail, demoPassword }: { demoEmail?: string; demoPassword?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Unable to sign in.");
        setLoading(false);
        return;
      }
      router.replace(next.startsWith("/") ? next : "/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const fillDemo = () => {
    if (!demoEmail || !demoPassword) return;
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
      <div>
        <label htmlFor="email" className="label">
          Email address
        </label>
        <div className="relative">
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@ceyteq.com"
            className="neu-input pl-11"
          />
          <Icon.mail
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-300"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="neu-input pl-11 pr-11"
          />
          <Icon.shield
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-300"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-navy-300 transition-colors hover:text-ceyteq-500"
          >
            <Icon.eye size={16} />
          </button>
        </div>
      </div>

      {error ? (
        <div role="alert" className="neu-inset flex items-start gap-2 rounded-xl px-3.5 py-3 text-[12.5px] font-semibold text-rose-600">
          <Icon.alert size={15} className="mt-0.5 shrink-0" />
          {error}
        </div>
      ) : null}

      <button type="submit" disabled={loading} className="neu-btn-dark neu-btn w-full !py-3.5">
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Signing in…
          </>
        ) : (
          <>
            Enter dashboard
            <Icon.arrowRight size={16} />
          </>
        )}
      </button>

      {demoEmail && demoPassword ? (
        <button
          type="button"
          onClick={fillDemo}
          className="neu-btn w-full !py-2.5 !text-[12px] text-navy-400"
        >
          <Icon.sparkles size={14} className="text-ceyteq-500" />
          Use seeded demo credentials
        </button>
      ) : null}
    </form>
  );
}
