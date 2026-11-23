import { useEffect, useRef, useState } from "react";
import { featuredGame as game, games } from "../data";

// A short looping clip that only plays while it is on screen, so four videos never run at once off-screen.
function LoopClip({ src, label }: { src: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const watcher = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.35 },
    );
    watcher.observe(video);
    return () => watcher.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      className="aspect-video w-full object-cover"
      src={src}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={label}
    />
  );
}

export default function Games() {
  const [shot, setShot] = useState(0);
  const media = game.media;
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
              One is about to ship. The rest are on the bench, built in public
              through Learning the Wires.
            </p>
          </div>
          <p className="font-mono text-[0.68rem] tracking-[0.18em] text-muted uppercase">
            Unity / Unreal Engine 5
          </p>
        </div>

        {/* Featured: Table Tanks VR */}
        <article className="hud-card hud-corners">
          <span className="hud-bl" />
          <span className="hud-br" />
          <div className="grid lg:grid-cols-[1.35fr_1fr]">
            <div className="relative flex items-center border-b border-volt/10 bg-black lg:border-r lg:border-b-0">
              <video
                className="aspect-video w-full object-contain"
                src={`${media}/trailer.mp4`}
                poster={`${media}/poster.jpg`}
                controls
                playsInline
                preload="none"
                aria-label={`${game.title} trailer`}
              />
            </div>
            <div className="flex flex-col p-6 md:p-8">
              <div className="mb-6 flex items-center justify-between">
                <span className="font-mono text-[0.65rem] tracking-[0.18em] text-muted">{game.code}</span>
                <span className="inline-flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.16em] text-volt uppercase">
                  <span className="status-dot" />
                  {game.status}
                </span>
              </div>
              <img
                src={`${media}/logo.webp`}
                alt={game.title}
                width={800}
                height={400}
                className="mb-5 h-auto w-full max-w-[19rem]"
                loading="lazy"
              />
              <p className="font-display text-xl font-extrabold uppercase tracking-tight">{game.tagline}</p>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{game.copy}</p>
              <ul className="mt-5 list-none space-y-2 p-0 text-sm text-ink/90">
                {game.features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <span className="mt-[0.55rem] h-1 w-3 shrink-0 bg-volt" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
              <p className="mt-auto pt-6 font-mono text-[0.65rem] tracking-[0.18em] text-muted uppercase">
                {game.platform} / {game.engine}
              </p>
            </div>
          </div>

          <dl className="m-0 grid grid-cols-2 gap-px border-t border-volt/10 bg-volt/10 md:grid-cols-4">
            {game.stats.map((stat) => (
              <div key={stat.label} className="bg-void p-5 md:p-6">
                <dt className="font-mono text-[0.62rem] tracking-[0.18em] text-muted uppercase">{stat.label}</dt>
                <dd className="m-0 mt-2 font-display text-3xl font-extrabold tracking-tight text-volt">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </article>

        {/* Gameplay clips */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {game.clips.map((clip) => (
            <figure key={clip.file} className="hud-card hud-lift m-0">
              <LoopClip src={`${media}/${clip.file}`} label={`${game.title}: ${clip.label}`} />
              <figcaption className="p-4">
                <p className="font-mono text-[0.65rem] tracking-[0.18em] text-volt uppercase">{clip.label}</p>
                <p className="mt-1 text-sm text-muted">{clip.note}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Screenshots */}
        <div className="hud-card hud-corners mt-4">
          <span className="hud-bl" />
          <span className="hud-br" />
          <img
            src={`${media}/${game.shots[shot].file}`}
            alt={game.shots[shot].alt}
            width={1600}
            height={900}
            className="aspect-video w-full object-cover"
            loading="lazy"
          />
          <div className="grid grid-cols-4 gap-px border-t border-volt/10 bg-volt/10">
            {game.shots.map((item, i) => (
              <button
                key={item.file}
                type="button"
                onClick={() => setShot(i)}
                aria-label={`Show screenshot: ${item.alt}`}
                aria-pressed={i === shot}
                className={`relative border-0 bg-void p-0 transition-opacity ${i === shot ? "opacity-100" : "opacity-55 hover:opacity-90"}`}
              >
                <img src={`${media}/${item.file}`} alt="" className="aspect-video w-full object-cover" loading="lazy" />
                {i === shot && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-volt" aria-hidden />}
              </button>
            ))}
          </div>
        </div>

        {/* The rest of the bench */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {games.map((item) => (
            <article key={item.code} className="hud-card hud-corners hud-lift p-6">
              <span className="hud-bl" />
              <span className="hud-br" />
              <div className="mb-8 flex items-center justify-between">
                <span className="font-mono text-[0.65rem] tracking-[0.18em] text-muted">{item.code}</span>
                <span className="inline-flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.16em] text-volt uppercase">
                  <span className="status-dot" />
                  {item.status}
                </span>
              </div>
              <h3 className="font-display text-xl font-extrabold uppercase tracking-tight">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.note}</p>
              <p className="mt-6 font-mono text-[0.62rem] tracking-[0.18em] text-muted uppercase">{item.engine}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
