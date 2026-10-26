import { Icon } from "@/components/icons";
import { CONTACT_CHANNELS, SOCIAL_LINKS, SITE } from "@/lib/site-config";

/**
 * Home page contact block. Every link is a real, official Ceyteq destination
 * sourced from `src/lib/site-config.ts`.
 */
export function ContactSection() {
  return (
    <section id="contact" className="scroll-mt-28 pb-16 sm:pb-20">
      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        {/* Contact channels */}
        <div className="neu-raised rounded-neu-lg p-6 sm:p-8">
          <p className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.2em] text-navy-300">
            <Icon.sparkles size={13} className="text-ceyteq-500" />
            Contact
          </p>
          <h2 className="mt-3 text-[24px] font-bold leading-tight text-navy-700 sm:text-[30px]">
            Talk to the Ceyteq team
          </h2>
          <p className="mt-2.5 max-w-md text-[13.5px] leading-relaxed text-navy-400">
            Questions about onboarding, branding or your listing? Call the hotline, message us on
            WhatsApp, or email the team — whichever suits you.
          </p>

          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {CONTACT_CHANNELS.map((channel) => {
              const Glyph = Icon[channel.icon];
              return (
                <li key={channel.id}>
                  <a
                    href={channel.href}
                    {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group flex h-full items-center gap-3 rounded-2xl bg-white/55 p-3.5 shadow-neu-inset transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/80"
                  >
                    <span className="neu-orb h-10 w-10 shrink-0 text-ceyteq-500">
                      <Glyph size={16} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-navy-300">
                        {channel.label}
                      </span>
                      <span className="block truncate text-[13px] font-bold text-navy-600 group-hover:text-ceyteq-600">
                        {channel.value}
                      </span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Social profiles */}
        <div className="neu-raised rounded-neu-lg p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.2em] text-navy-300">
                <Icon.globe size={13} className="text-ceyteq-500" />
                Follow Ceyteq
              </p>
              <h3 className="mt-3 text-[20px] font-bold text-navy-700 sm:text-[22px]">
                Seven channels, one digital race
              </h3>
            </div>
            <span className="neu-badge bg-ceyteq-500/10 text-ceyteq-700">{SOCIAL_LINKS.length} links</span>
          </div>

          <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {SOCIAL_LINKS.map((social) => {
              const Glyph = Icon[social.icon];
              return (
                <li key={social.id}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-2xl border border-white/60 bg-white/40 px-3.5 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-ceyteq-500/30 hover:bg-white/75"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[linear-gradient(145deg,#ffffff_0%,#eaeff6_100%)] text-navy-400 shadow-[2px_2px_5px_rgba(163,177,198,0.5),-2px_-2px_5px_rgba(255,255,255,0.9)] transition-colors group-hover:text-ceyteq-500">
                      <Glyph size={15} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-bold text-navy-600">{social.label}</span>
                      <span className="block truncate text-[11px] font-semibold text-navy-300">
                        {social.handle}
                      </span>
                    </span>
                    <Icon.external
                      size={13}
                      className="shrink-0 text-navy-200 transition-colors group-hover:text-ceyteq-500"
                    />
                  </a>
                </li>
              );
            })}
          </ul>

          <p className="mt-5 text-[11.5px] font-semibold text-navy-300">
            {SITE.company} · {SITE.tagline}
          </p>
        </div>
      </div>
    </section>
  );
}
