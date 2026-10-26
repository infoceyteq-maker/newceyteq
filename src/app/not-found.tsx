import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="mb-8 flex justify-center">
          <Logo height={44} />
        </div>
        <div className="neu-raised rounded-neu-lg p-8 sm:p-10">
          <div className="neu mx-auto grid h-16 w-16 place-items-center rounded-2xl text-ceyteq-500">
            <Icon.search size={26} />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-navy-700">This form isn&apos;t here</h1>
          <p className="mx-auto mt-3 max-w-sm text-[14px] leading-relaxed text-navy-400">
            The link may have been unpublished, renamed, or never existed. Ask the Ceyteq team for a
            fresh onboarding link.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/" className="neu-btn-primary neu-btn">
              Back to home
              <Icon.arrowRight size={15} />
            </Link>
            <Link href="/form/restaurant-onboarding" className="neu-btn">
              Restaurant onboarding
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
