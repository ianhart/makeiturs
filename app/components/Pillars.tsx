const pillars = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    title: "Brand System OS",
    description:
      "We codify your brand once, so every location executes flawlessly. From logo and typography to photography direction and voice, we turn your brand into a usable system with locked templates your team can't break\u2014but can easily use.",
    link: "See what\u2019s included in Brand System OS",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    title: "Menu & Campaign Engine",
    description:
      "We build the menu templates and campaign-in-a-box kits your locations can plug in all year. Seasonal drops, openings, slow-day promos\u2014each comes with menus, social posts, emails, and in-store assets ready to deploy in days, not weeks.",
    link: "View sample campaigns",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Brand Command Center",
    description:
      "We give you a simple command center to see brand health across all locations\u2014reviews, social cadence, and live campaigns\u2014plus a monthly strategy huddle so decisions are made in minutes, not endless email threads.",
    link: "How Brand Command works",
  },
];

export default function Pillars() {
  return (
    <section id="pillars" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark tracking-tight">
            What Restaurant Growth OS{" "}
            <span className="text-gold">Actually Does</span>
          </h2>
          <p className="mt-4 text-lg text-slate-blue leading-relaxed">
            Instead of random projects and one-off campaigns, we build the
            infrastructure that lets your brand scale from 3 to 30 locations with
            consistency and speed.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="group relative bg-cream/30 rounded-2xl p-8 border border-gray-100 hover:border-gold/30 hover:shadow-xl hover:shadow-gold/5 transition-all duration-300"
            >
              <div className="w-14 h-14 flex items-center justify-center bg-gold/10 text-gold rounded-xl mb-6 group-hover:bg-gold group-hover:text-white transition-colors">
                {pillar.icon}
              </div>
              <h3 className="text-xl font-bold text-dark mb-3">
                {pillar.title}
              </h3>
              <p className="text-slate-blue leading-relaxed mb-6">
                {pillar.description}
              </p>
              <span className="inline-flex items-center text-gold font-medium text-sm group-hover:gap-2 transition-all">
                {pillar.link}
                <svg
                  className="w-4 h-4 ml-1"
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
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
