import { links } from "../data";

export default function Channel() {
  return (
    <section id="wires" className="section relative z-10 border-y border-volt/10 bg-panel/70">
      <div className="container-page grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <div>
          <p className="kicker mb-4">Broadcast</p>
          <h2 className="display text-[clamp(2rem,5vw,3.4rem)]">
            Learning the
            <span className="text-volt"> Wires</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            Unreal Engine, game development, and coding — recorded while it is
            still being figured out. The channel is the public log. The studio is
            the shop it comes from.
          </p>
          <ul className="mt-8 space-y-3 font-mono text-[0.78rem] tracking-[0.08em] text-ink/90">
            <li className="flex gap-3">
              <span className="text-volt">▸</span> Unreal Engine 5
            </li>
            <li className="flex gap-3">
              <span className="text-volt">▸</span> C++ and Blueprints
            </li>
            <li className="flex gap-3">
              <span className="text-volt">▸</span> Game feel, tools, and process
            </li>
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={links.youtube}
              className="btn btn-volt"
              target="_blank"
              rel="noreferrer"
            >
              Subscribe
            </a>
            <a href="#games" className="btn btn-ghost">
              See the games
            </a>
          </div>
        </div>

        <div className="hud-card hud-corners">
          <span className="hud-bl" />
          <span className="hud-br" />
          <div className="flex items-center gap-2 border-b border-volt/12 px-4 py-2.5">
            <span className="status-dot" />
            <span className="font-mono text-[0.62rem] tracking-[0.2em] text-muted uppercase">
              youtube.com/@LearningTheWires
            </span>
          </div>
          <div className="aspect-video bg-void">
            <iframe
              title="Learning the Wires on YouTube"
              src="https://www.youtube.com/embed?listType=user_uploads&list=LearningTheWires"
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
