const steps = [
  {
    number: "01",
    title: "Diagnose & Design the OS",
    description:
      "We start with a deep-dive session to map your brand, locations, menus, and growth plans. Then we design your Brand System OS, menu templates, and first 2\u20133 campaigns so everything is aligned with your operations and P&L.",
  },
  {
    number: "02",
    title: "Install Across Locations",
    description:
      "We roll out the system: brand library, menu files, campaign kits, and your Brand Command Center. Your team gets a clear playbook and training so GMs and marketers know exactly how to use it.",
  },
  {
    number: "03",
    title: "Run & Optimize",
    description:
      "Each month we refresh assets, load new campaigns, and review your Brand Health Score with you. You stay focused on operations while we keep the brand and marketing system moving forward.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-cream/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark tracking-tight">
            How Restaurant Growth OS{" "}
            <span className="text-gold">Works</span>
          </h2>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Connecting line */}
          <div className="hidden md:block absolute left-[39px] top-0 bottom-0 w-px bg-gradient-to-b from-gold/20 via-gold to-gold/20" />

          <div className="flex flex-col gap-12 md:gap-16">
            {steps.map((step, i) => (
              <div key={step.number} className="flex gap-6 md:gap-10">
                {/* Number circle */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-dark flex items-center justify-center text-gold text-2xl font-bold shadow-lg relative z-10">
                    {step.number}
                  </div>
                </div>
                {/* Content */}
                <div className="pt-2">
                  <h3 className="text-2xl font-bold text-dark mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate-blue leading-relaxed text-lg">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <a
            href="#cta"
            className="inline-flex items-center px-8 py-4 bg-gold text-white text-lg font-semibold rounded-lg hover:bg-gold-light transition-all hover:scale-105 shadow-lg shadow-gold/25"
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
      </div>
    </section>
  );
}
