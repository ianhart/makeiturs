const projects = [
  {
    name: "Take Ur Seat",
    description:
      "Multi-location brand system, menu engine, and launch playbooks.",
    color: "from-dark to-slate-blue",
  },
  {
    name: "TUS Lite",
    description:
      "Food hall adaptation with grab-and-go campaign kits.",
    color: "from-slate-blue to-gold",
  },
  {
    name: "+Bake Cafe",
    description:
      "Caf\u00e9 brand system, seasonal menu engine, and content templates.",
    color: "from-gold to-dark",
  },
];

export default function Portfolio() {
  return (
    <section id="portfolio" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark tracking-tight">
            Systems Built for{" "}
            <span className="text-gold">Restaurant Growth</span>
          </h2>
          <p className="mt-4 text-lg text-slate-blue leading-relaxed">
            We don&apos;t just design pretty brands&mdash;we architect the
            systems behind growing concepts like Take Ur Seat, TUS Lite, and
            +Bake Cafe.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div
              key={project.name}
              className="group relative overflow-hidden rounded-2xl"
            >
              {/* Gradient placeholder for project image */}
              <div
                className={`aspect-[4/3] bg-gradient-to-br ${project.color} flex items-center justify-center`}
              >
                <span className="text-white/20 text-6xl font-bold">
                  {project.name.charAt(0)}
                </span>
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/20 to-transparent flex items-end p-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {project.name}
                  </h3>
                  <p className="text-white/70 text-sm">
                    {project.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
