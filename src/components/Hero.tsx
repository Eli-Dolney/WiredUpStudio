import { links } from "../data";

export default function Hero() {
  return (
    <section id="top" className="relative flex min-h-dvh items-end pb-16 pt-28">
      <div className="container-page relative z-10 w-full">
        <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="kicker">Studio 01 · Online</p>
        </div>

        <h1 className="display text-[clamp(4.2rem,18vw,11.5rem)] text-ink">
          Wired
          <br />
          <span className="text-volt">Up</span>
        </h1>
        <p className="mt-3 font-display text-[clamp(1.4rem,4vw,2.4rem)] font-extrabold tracking-[0.18em] text-ink/80 uppercase">
          Studios
        </p>

        <p className="mt-8 max-w-xl text-[1.05rem] leading-relaxed text-muted sm:text-lg">
          The house behind Learning the Wires. Games, tutorials, and everything else
          currently on the bench — one current, several circuits.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a href="#wires" className="btn btn-volt">
            Learning the Wires
          </a>
          <a href="#games" className="btn btn-ghost">
            Enter the shop
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

      <aside className="pointer-events-none absolute right-[max(1.25rem,calc((100%-72rem)/2+1.25rem))] top-1/2 z-10 hidden -translate-y-1/2 lg:block">
        <div className="hud-card hud-corners w-44 p-4">
          <span className="hud-bl" />
          <span className="hud-br" />
          <p className="font-mono text-[0.58rem] tracking-[0.2em] text-muted uppercase">
            Status
          </p>
          <p className="mt-3 font-mono text-xl tracking-[0.12em] text-volt uppercase">
            Online
          </p>
          <p className="mt-4 font-mono text-[0.58rem] leading-5 tracking-[0.12em] text-muted uppercase">
            Channel live
            <br />
            Games charging
            <br />
            Lab online
          </p>
        </div>
      </aside>
    </section>
  );
}
