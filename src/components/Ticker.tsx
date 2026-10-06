const items = [
  "Learning the Wires",
  "Unreal Engine 5",
  "Game Development",
  "C++ / Blueprints",
  "The Lab",
  "Keep charging",
];

export default function Ticker() {
  const line = [...items, ...items];
  return (
    <div className="relative z-10 overflow-hidden border-y border-volt/12 bg-panel/80">
      <div className="flex w-max animate-[marquee_28s_linear_infinite] py-3">
        {line.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-6 px-6 font-mono text-[0.68rem] tracking-[0.28em] text-muted uppercase"
          >
            <span className="text-volt">◆</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
