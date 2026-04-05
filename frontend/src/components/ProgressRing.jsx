export default function ProgressRing({
  percentage = 0, size = 80, stroke = 7, color = '#6366f1'
}) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const pct = Math.min(Math.max(percentage, 0), 100)
  const offset = circ - (pct / 100) * circ

  const ringColor = pct >= 100
    ? '#ef4444'
    : pct >= 80
    ? '#f59e0b'
    : color

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="var(--bg-tertiary)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={ringColor}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.3s ease' }}
      />
    </svg>
  )
}
