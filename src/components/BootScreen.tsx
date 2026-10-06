import { useEffect, useRef, useState } from "react";
import VoltMark from "./VoltMark";

type Props = {
  onDone: () => void;
};

export default function BootScreen({ onDone }: Props) {
  const [phase, setPhase] = useState<"charge" | "flash" | "out">("charge");
  const [percent, setPercent] = useState(0);
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    setPhase("out");
    window.setTimeout(onDone, 420);
  };

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      finish();
      return;
    }

    const start = performance.now();
    const duration = 2200;
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setPercent(Math.round(eased * 100));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setPhase("flash");
        window.setTimeout(finish, 380);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-void transition-opacity duration-500 ${
        phase === "out" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      role="dialog"
      aria-label="Studio boot sequence"
      onClick={finish}
    >
      {phase === "flash" && (
        <div className="pointer-events-none absolute inset-0 bg-volt animate-[flash_0.38s_ease-out_forwards]" />
      )}

      <p className="kicker mb-10">Wired Up Studios · Boot</p>

      <VoltMark className="h-16 w-16 text-volt animate-[bolt-in_0.9s_ease_forwards]" />

      <div className="mt-10 w-[min(22rem,78vw)]">
        <div className="mb-2 flex items-center justify-between font-mono text-[0.65rem] tracking-[0.22em] text-muted uppercase">
          <span>Voltage</span>
          <span className="text-volt">{percent.toString().padStart(3, "0")}%</span>
        </div>
        <div className="h-[3px] overflow-hidden bg-line">
          <div
            className="h-full bg-volt shadow-[0_0_16px_var(--color-volt)]"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <p className="mt-8 font-mono text-[0.65rem] tracking-[0.24em] text-muted uppercase">
        Click to skip
      </p>
    </div>
  );
}
