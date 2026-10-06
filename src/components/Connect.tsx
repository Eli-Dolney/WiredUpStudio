import { links } from "../data";

export default function Connect() {
  return (
    <section id="connect" className="section relative z-10">
      <div className="container-page">
        <div className="hud-card hud-corners px-6 py-10 md:px-12 md:py-14">
          <span className="hud-bl" />
          <span className="hud-br" />
          <p className="kicker mb-4">Signal</p>
          <h2 className="display max-w-3xl text-[clamp(2.1rem,6vw,4.2rem)]">
            Keep learning
            <span className="text-volt"> the wires.</span>
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            Watch the channel or jump in Discord. Wired Up is the studio. Everything else is a circuit off the same board.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={links.youtube}
              className="btn btn-volt"
              target="_blank"
              rel="noreferrer"
            >
              YouTube
            </a>
            <a
              href={links.discord}
              className="btn btn-ghost"
              target="_blank"
              rel="noreferrer"
            >
              Discord
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
