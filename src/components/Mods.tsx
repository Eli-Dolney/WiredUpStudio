import { bo3Mods, minecraftMods } from "../data";

type Mod = { title: string; tag: string; note: string; href?: string };

function ModCard({ mod }: { mod: Mod }) {
  const body = (
    <>
      <span className="hud-bl" />
      <span className="hud-br" />
      <p className="font-mono text-[0.62rem] tracking-[0.18em] text-volt uppercase">{mod.tag}</p>
      <h4 className="mt-4 font-display text-lg font-extrabold uppercase tracking-tight">{mod.title}</h4>
      <p className="mt-2 text-sm leading-relaxed text-muted">{mod.note}</p>
      {mod.href && (
        <p className="mt-5 font-mono text-[0.62rem] tracking-[0.18em] text-volt uppercase transition-transform group-hover:translate-x-1">
          Source on GitHub →
        </p>
      )}
    </>
  );
  return mod.href ? (
    <a href={mod.href} target="_blank" rel="noreferrer" className="hud-card hud-corners hud-lift group block p-5">
      {body}
    </a>
  ) : (
    <article className="hud-card hud-corners p-5">{body}</article>
  );
}

function Group({
  kicker,
  title,
  copy,
  mods,
  columns,
}: {
  kicker: string;
  title: string;
  copy: string;
  mods: Mod[];
  columns: string;
}) {
  return (
    <div>
      <div className="mb-6 flex flex-col gap-2 border-b border-volt/10 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[0.65rem] tracking-[0.2em] text-muted uppercase">{kicker}</p>
          <h3 className="mt-2 font-display text-2xl font-extrabold uppercase tracking-tight">{title}</h3>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-muted md:text-right">{copy}</p>
      </div>
      <div className={`grid gap-4 ${columns}`}>
        {mods.map((mod) => (
          <ModCard key={mod.title} mod={mod} />
        ))}
      </div>
    </div>
  );
}

export default function Mods() {
  return (
    <section id="mods" className="section relative z-10 border-t border-volt/10">
      <div className="container-page">
        <div className="mb-12 max-w-xl">
          <p className="kicker mb-4">Rewired</p>
          <h2 className="display text-[clamp(2rem,5vw,3.4rem)]">
            Mods on the
            <span className="text-volt"> grid</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            Other people&apos;s games, rewired. Minecraft mods you can download today,
            and Black Ops III zombies maps taking shape in the mod tools.
          </p>
        </div>

        <div className="space-y-14">
          <Group
            kicker={`${minecraftMods.length} projects`}
            title="Minecraft"
            copy="Java Edition mods and a shader pack, open source. Each repository has downloads and install steps."
            mods={minecraftMods}
            columns="sm:grid-cols-2 lg:grid-cols-4"
          />
          <Group
            kicker="In the mod tools"
            title="Black Ops III"
            copy="Custom zombies maps in development. Workshop links will land here when they are published."
            mods={bo3Mods}
            columns="md:grid-cols-3"
          />
        </div>
      </div>
    </section>
  );
}
