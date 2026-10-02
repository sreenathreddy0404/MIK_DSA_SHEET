export function ProgressBar({ value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  // Dynamic gradient: violet for low, emerald for high, amber for warning middle
  const gradient = color
    ? color
    : pct === 100
    ? "linear-gradient(90deg, oklch(0.48 0.17 155), oklch(0.60 0.17 155))"
    : pct >= 60
    ? "linear-gradient(90deg, oklch(0.50 0.22 290), oklch(0.48 0.17 155))"
    : pct >= 30
    ? "linear-gradient(90deg, oklch(0.50 0.22 290), oklch(0.64 0.17 65))"
    : "linear-gradient(90deg, oklch(0.50 0.22 290), oklch(0.52 0.18 225))";

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{
          width: `${pct}%`,
          background: gradient,
          boxShadow: pct === 100 ? "0 0 8px oklch(0.48 0.17 155 / 0.5)" : "none",
        }}
      />
    </div>
  );
}

