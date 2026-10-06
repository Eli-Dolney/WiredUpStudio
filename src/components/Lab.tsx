import { lab } from "../data";

export default function Lab() {
  return (
    <section id="lab" className="section relative z-10 border-y border-volt/10">
      <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <p className="kicker mb-4">Side current</p>
          <h2 className="display text-[clamp(2rem,5vw,3.4rem)]">The Lab</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            Not every circuit is a game or a video. The lab is where tools, sites,
            and experiments sit until they earn a name of their own.
          </p>
        </div>
        <div className="divide-y divide-volt/10 border-y border-volt/10">
          {lab.map((item, i) => (
            <article key={item.title} className="flex gap-6 py-6">
              <span className="font-mono text-[0.68rem] tracking-[0.2em] text-volt">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-xl font-extrabold uppercase tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-2 max-w-lg text-[0.95rem] leading-relaxed text-muted">
                  {item.note}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
