import { useEffect, useRef } from "react";

type Wire = {
  points: { x: number; y: number }[];
  length: number;
  spark: number;
  speed: number;
};

function lengthOf(points: { x: number; y: number }[]) {
  let n = 0;
  for (let i = 1; i < points.length; i++) {
    n += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return n;
}

function pointAt(points: { x: number; y: number }[], t: number) {
  const target = t * lengthOf(points);
  let walked = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const seg = Math.hypot(dx, dy);
    if (walked + seg >= target) {
      const u = (target - walked) / seg;
      return { x: points[i - 1].x + dx * u, y: points[i - 1].y + dy * u };
    }
    walked += seg;
  }
  return points[points.length - 1];
}

function buildWires(w: number, h: number): Wire[] {
  const pad = 28;
  const paths = [
    [
      { x: pad, y: h * 0.18 },
      { x: w * 0.22, y: h * 0.18 },
      { x: w * 0.22, y: h * 0.42 },
      { x: w * 0.08, y: h * 0.42 },
      { x: w * 0.08, y: h * 0.72 },
    ],
    [
      { x: w - pad, y: h * 0.12 },
      { x: w * 0.72, y: h * 0.12 },
      { x: w * 0.72, y: h * 0.34 },
      { x: w * 0.88, y: h * 0.34 },
      { x: w * 0.88, y: h * 0.62 },
      { x: w - pad, y: h * 0.62 },
    ],
    [
      { x: pad, y: h - pad },
      { x: w * 0.38, y: h - pad },
      { x: w * 0.38, y: h * 0.78 },
      { x: w * 0.58, y: h * 0.78 },
      { x: w * 0.58, y: h - pad * 1.6 },
    ],
    [
      { x: w * 0.5, y: pad },
      { x: w * 0.5, y: h * 0.16 },
      { x: w * 0.62, y: h * 0.16 },
    ],
    [
      { x: pad, y: h * 0.55 },
      { x: w * 0.16, y: h * 0.55 },
      { x: w * 0.16, y: h * 0.88 },
    ],
  ];

  return paths.map((points, i) => ({
    points,
    length: lengthOf(points),
    spark: Math.random(),
    speed: 0.00018 + i * 0.00004,
  }));
}

export default function CircuitField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let wires: Wire[] = [];
    let frame = 0;
    let running = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { innerWidth: w, innerHeight: h } = window;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      wires = buildWires(w, h);
    };

    const draw = () => {
      if (!running) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(210, 255, 31, 0.09)";
      ctx.lineWidth = 1.25;
      ctx.lineCap = "square";
      ctx.lineJoin = "miter";

      for (const wire of wires) {
        ctx.beginPath();
        wire.points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();

        wire.points.forEach((p) => {
          ctx.fillStyle = "rgba(210, 255, 31, 0.35)";
          ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
        });

        if (!reduced) {
          wire.spark = (wire.spark + wire.speed * 16) % 1;
          const spark = pointAt(wire.points, wire.spark);
          const glow = ctx.createRadialGradient(spark.x, spark.y, 0, spark.x, spark.y, 18);
          glow.addColorStop(0, "rgba(210, 255, 31, 0.9)");
          glow.addColorStop(1, "rgba(210, 255, 31, 0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(spark.x, spark.y, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#d2ff1f";
          ctx.fillRect(spark.x - 2, spark.y - 2, 4, 4);
        }
      }

      frame = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
}
