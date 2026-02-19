export default function CTA() {
  return (
    <section
      id="cta"
      className="py-20 md:py-28 bg-gradient-to-br from-dark via-slate to-slate-blue relative overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
          Ready to Systemize Your
          <span className="block text-gold mt-2">Restaurant Growth?</span>
        </h2>
        <p className="mt-6 text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
          Book a 30-minute Restaurant Growth OS call. We&apos;ll diagnose
          your brand gaps, map your growth timeline, and show you exactly how
          the system works for groups like yours.
        </p>

        <div className="mt-10">
          <a
            href="#"
            className="inline-flex items-center px-10 py-5 bg-gold text-white text-lg font-semibold rounded-lg hover:bg-gold-light transition-all hover:scale-105 shadow-xl shadow-gold/30"
          >
            Book a Restaurant Growth OS Call
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>

        <p className="mt-6 text-white/50 text-sm">
          No commitment. No pitch deck required. Just a conversation about
          your growth.
        </p>
      </div>
    </section>
  );
}
