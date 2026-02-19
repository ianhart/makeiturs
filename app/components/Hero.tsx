import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative pt-28 pb-20 md:pt-40 md:pb-32 bg-gradient-to-br from-dark via-slate to-slate-blue overflow-hidden">
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
            <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            <span className="text-sm text-white/90 font-medium">
              The Operating System for Restaurant Growth
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
            Restaurant Growth OS
            <span className="block text-gold mt-2">
              for Multi-Location Brands
            </span>
          </h1>

          <p className="mt-6 md:mt-8 text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
            A done-for-you marketing operating system for restaurant groups. One
            partner to systemize your brand, menus, and campaigns across every
            location&mdash;without you babysitting creatives.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href="#cta"
              className="inline-flex items-center justify-center px-8 py-4 bg-gold text-white text-lg font-semibold rounded-lg hover:bg-gold-light transition-all hover:scale-105 shadow-lg shadow-gold/25"
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
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white text-lg font-semibold rounded-lg hover:bg-white/10 transition-all"
            >
              See How It Works
            </a>
          </div>

          {/* Logo mark */}
          <div className="mt-16 md:mt-20">
            <Image
              src="/logo.svg"
              alt="Make It Urs"
              width={120}
              height={120}
              className="w-24 h-24 md:w-32 md:h-32 opacity-30"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
