const features = [
  "Brand System OS (guidelines + asset library + templates)",
  "Menu Engine setup (core menu + seasonal templates)",
  "2 Campaign-in-a-Box kits per quarter",
  "Brand Command Center dashboard",
  "Monthly Brand Health Huddle (30 minutes)",
  "Central request queue & 48-hour turnaround on standard assets",
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-cream/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark tracking-tight">
            Restaurant Growth OS{" "}
            <span className="text-gold">Plans</span>
          </h2>
          <p className="mt-4 text-lg text-slate-blue leading-relaxed">
            Simple, scalable plans based on how many locations and how fast
            you&apos;re growing.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-3xl shadow-xl shadow-dark/5 border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-dark p-8 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/20 text-gold text-sm font-medium rounded-full mb-4">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-white">
                Restaurant Growth OS &mdash; Core
              </h3>
              <p className="mt-2 text-white/70">
                For groups with 3&ndash;7 locations ready to standardize their
                brand and marketing.
              </p>
            </div>

            {/* Features */}
            <div className="p-8">
              <ul className="space-y-4">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-gold flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-slate">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#cta"
                className="mt-8 w-full inline-flex items-center justify-center px-8 py-4 bg-gold text-white text-lg font-semibold rounded-lg hover:bg-gold-light transition-all hover:scale-105 shadow-lg shadow-gold/25"
              >
                Apply for Restaurant Growth OS
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
