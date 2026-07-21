type BarDatum = {
  label: string;
  value: number;
  tone?: "good" | "rust" | "navy";
  displayValue: string;
};

// Pure CSS horizontal bar chart. Percent widths are computed server-side
// against the largest value in the set, so this needs no client JS and no
// charting library — it just renders as static HTML/CSS.
export function BarChart({ data, emptyLabel }: { data: BarDatum[]; emptyLabel: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));

  if (data.length === 0) {
    return <p className="panel-empty">{emptyLabel}</p>;
  }

  return (
    <div className="bar-chart">
      {data.map((d) => {
        const pct = Math.max(2, Math.round((d.value / max) * 100));
        return (
          <div className="bar-chart-row" key={d.label}>
            <span className="bar-chart-label">{d.label}</span>
            <div className="bar-chart-track">
              <div
                className={`bar-chart-fill ${d.tone ?? "navy"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="bar-chart-value">{d.displayValue}</span>
          </div>
        );
      })}
    </div>
  );
}
