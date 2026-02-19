const blocks = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    title: "Built in a Restaurant Group",
    description:
      "We refined this OS inside our own brands\u2014Take Ur Seat, TUS Lite, +Bake, Gud2Go\u2014before offering it to others. We understand the tension between ops reality, menu execution, and brand consistency.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: "Systems, Not One-Offs",
    description:
      "Everything we build is designed to be reused: brand templates, menu layouts, campaign kits, and dashboards. That means each new location is faster, cheaper, and cleaner to launch than the last.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Human Strategy on Top of Automation",
    description:
      "We lean on templates, playbooks, and automation behind the scenes, but you always get a single strategic point of contact who understands your group and makes recommendations proactively.",
  },
];

export default function Differentiators() {
  return (
    <section className="py-20 md:py-28 bg-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Why Restaurant Groups{" "}
            <span className="text-gold">Choose MIU</span>
          </h2>
          <p className="mt-4 text-lg text-white/70 leading-relaxed">
            Marcus doesn&apos;t want &ldquo;more designers.&rdquo; He wants one
            system and one partner who make his brand look like a $50M group
            while he scales operations.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {blocks.map((block) => (
            <div
              key={block.title}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-gold/30 transition-all"
            >
              <div className="w-14 h-14 flex items-center justify-center bg-gold/20 text-gold rounded-xl mb-6">
                {block.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {block.title}
              </h3>
              <p className="text-white/70 leading-relaxed">
                {block.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
