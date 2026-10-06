import { links } from "../data";
import VoltMark from "./VoltMark";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-volt/12 py-8">
      <div className="container-page flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-volt">
          <VoltMark className="h-5 w-5" />
          <span className="font-display text-sm font-extrabold uppercase tracking-tight">
            Wired Up Studios
          </span>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[0.65rem] tracking-[0.16em] text-muted uppercase">
          <a href={links.youtube} className="hover:text-volt" target="_blank" rel="noreferrer">
            YouTube
          </a>
          <a href={links.discord} className="hover:text-volt" target="_blank" rel="noreferrer">
            Discord
          </a>
        </div>
        <p className="font-mono text-[0.62rem] tracking-[0.16em] text-muted uppercase">
          © {new Date().getFullYear()} · Stay charged
        </p>
      </div>
    </footer>
  );
}
