export default function LogoStrip() {
  const brands = [
    "Take Ur Seat",
    "TUS Lite",
    "+Bake Cafe",
    "Gud2Go",
  ];

  return (
    <section className="py-12 md:py-16 bg-cream/50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-slate-blue/70 uppercase tracking-wider mb-8">
          Trusted by restaurant and hospitality brands building multi-location
          growth
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {brands.map((brand) => (
            <div
              key={brand}
              className="text-lg md:text-xl font-bold text-slate-blue/40 hover:text-slate-blue/70 transition-colors"
            >
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
