import { games } from "../data";

export default function Games() {
  return (
    <section id="games" className="section relative z-10">
      <div className="container-page">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="kicker mb-4">Shop floor</p>
            <h2 className="display text-[clamp(2rem,5vw,3.4rem)]">
              Games in
              <span className="text-volt"> current</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              Nothing here is pretending to be finished. These are the titles and
              prototypes on the bench — built in public through Learning the Wires.
            </p>
          </div>
          <p className="font-mono text-[0.68rem] tracking-[0.18em] text-muted uppercase">
            Unreal Engine 5
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {games.map((game) => (
            <article key={game.code} className="hud-card hud-corners hud-lift p-6">
              <span className="hud-bl" />
              <span className="hud-br" />
              <div className="mb-8 flex items-center justify-between">
                <span className="font-mono text-[0.65rem] tracking-[0.18em] text-muted">
                  {game.code}
                </span>
                <span className="inline-flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.16em] text-volt uppercase">
                  <span className="status-dot" />
                  {game.status}
                </span>
              </div>
              <h3 className="font-display text-xl font-extrabold uppercase tracking-tight">
                {game.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{game.note}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
