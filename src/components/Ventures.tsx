import { ventures } from "../data";

export default function Ventures() {
  return (
    <section id="studio" className="section relative z-10">
      <div className="container-page">
        <div className="mb-12 max-w-2xl">
          <p className="kicker mb-4">The house</p>
          <h2 className="display text-[clamp(2rem,5vw,3.4rem)]">
            One brand.
            <br />
            Several live wires.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            Wired Up Studios is the umbrella. Learning the Wires is how the work
            gets shown. Games and lab projects are what the work actually is.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {ventures.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="hud-card hud-corners hud-lift group block p-6 md:p-7"
            >
              <span className="hud-bl" />
              <span className="hud-br" />
              <div className="mb-10 flex items-center justify-between">
                <span className="font-mono text-[0.68rem] tracking-[0.22em] text-volt">
                  {item.id}
                </span>
                <span className="font-mono text-[0.62rem] tracking-[0.16em] text-muted uppercase">
                  {item.role}
                </span>
              </div>
              <h3 className="font-display text-2xl font-extrabold uppercase tracking-tight">
                {item.name}
              </h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{item.copy}</p>
              <p className="mt-8 font-mono text-[0.65rem] tracking-[0.2em] text-volt uppercase transition-transform group-hover:translate-x-1">
                Open circuit →
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
