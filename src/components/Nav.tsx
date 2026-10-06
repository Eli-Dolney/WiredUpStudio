import { useEffect, useState } from "react";
import { links, navItems } from "../data";
import VoltMark from "./VoltMark";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 transition-colors duration-300 ${
        scrolled || open ? "bg-void/88 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between border-b border-volt/10">
        <a href="/#top" className="flex items-center gap-2 text-volt" onClick={() => setOpen(false)}>
          <VoltMark className="h-6 w-6" />
          <span className="font-display text-[0.95rem] font-extrabold tracking-tight uppercase">
            Wired Up
          </span>
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href.startsWith("#") && window.location.pathname !== "/" ? `/${item.href}` : item.href}
              className="font-mono text-[0.68rem] tracking-[0.18em] text-muted uppercase transition-colors hover:text-volt"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <span className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.2em] text-muted uppercase">
            <span className="status-dot" />
            Live
          </span>
          <a href={links.youtube} className="btn btn-volt px-4 py-2" target="_blank" rel="noreferrer">
            YouTube
          </a>
        </div>

        <button
          type="button"
          className="relative h-10 w-10 text-volt md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className={`absolute left-2 right-2 h-px bg-current transition ${
              open ? "top-5 rotate-45" : "top-3.5"
            }`}
          />
          <span
            className={`absolute left-2 right-2 top-5 h-px bg-current transition ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute left-2 right-2 h-px bg-current transition ${
              open ? "top-5 -rotate-45" : "top-[1.6rem]"
            }`}
          />
        </button>
      </div>

      {open && (
        <nav
          className="container-page flex flex-col gap-1 border-b border-volt/15 bg-void py-6 md:hidden"
          aria-label="Mobile"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href.startsWith("#") && window.location.pathname !== "/" ? `/${item.href}` : item.href}
              className="py-3 font-display text-2xl uppercase text-ink"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a
            href={links.youtube}
            className="btn btn-volt mt-4"
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
          >
            Watch on YouTube
          </a>
        </nav>
      )}
    </header>
  );
}
