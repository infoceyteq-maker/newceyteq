import { Icon } from "@/components/icons";
import { LeadForm } from "@/components/site/LeadForm";
import { CONTACT_CHANNELS, SOCIAL_LINKS, SITE } from "@/lib/site-config";

/**
 * Home page contact block. Contact channels and social profiles are real,
 * official Ceyteq destinations from `src/lib/site-config.ts`; the enquiry form
 * writes straight into the admin "Leads & Inquiries" module.
 */
export function ContactSection() {
  return (
    <section id="contact" className="scroll-mt-28 pb-16 sm:pb-20">
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        {/* Contact channels */}
        <div className="neu-3d rounded-neu-lg p-6 sm:p-8">
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
                    className="group flex h-full items-center gap-3 rounded-2xl bg-white/45 p-3.5 shadow-neu-inset transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/75"
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

          <div className="neu-divider my-6" />

          <div className="flex flex-wrap items-center gap-2">
            {SOCIAL_LINKS.map((social) => {
              const Glyph = Icon[social.icon];
              return (
                <a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={`${social.label} · ${social.handle}`}
                  className="neu-orb h-10 w-10 text-navy-400 transition-all hover:-translate-y-0.5 hover:text-ceyteq-500"
                >
                  <Glyph size={16} />
                </a>
              );
            })}
          </div>
          <p className="mt-4 text-[11.5px] font-semibold text-navy-300">
            {SITE.company} · {SITE.tagline}
          </p>
        </div>

        {/* Enquiry form */}
        <div className="relative overflow-hidden rounded-neu-lg border border-white/70 bg-[linear-gradient(150deg,#f9fbfe_0%,#eef3f9_45%,#dfe7f0_100%)] p-6 shadow-[26px_26px_58px_rgba(148,163,186,0.5),-20px_-20px_50px_rgba(255,255,255,0.98)] sm:p-8">
          <div className="glow-blob -right-10 -top-12 h-40 w-40 bg-ceyteq-neon/25" />
          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.2em] text-navy-300">
                <span className="neon-dot" />
                Send an enquiry
              </p>
              <span className="neu-badge bg-ceyteq-neon/12 text-ceyteq-700">
                <Icon.bolt size={11} /> Replies in 1 day
              </span>
            </div>
            <h3 className="mt-3 text-[22px] font-bold leading-tight text-navy-700 sm:text-[26px]">
              Start your Digital Race
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-navy-400">
              Tell us where you found us and what you need — your enquiry lands directly in our leads
              dashboard.
            </p>

            <div className="mt-5">
              <LeadForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
