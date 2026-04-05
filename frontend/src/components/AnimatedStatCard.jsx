import { TrendingUp, TrendingDown } from 'lucide-react'
import Card from './ui/Card'
import { useCountUp } from '../hooks/useCountUp'
import { cn } from '../lib/utils'

export default function AnimatedStatCard({
  title, value, icon: Icon, color = 'accent',
  prefix = '', suffix = '', trend, trendLabel
}) {
  const animated = useCountUp(parseFloat(value) || 0)

  const colors = {
    accent:  { bg: 'var(--accent-light)',  icon: 'var(--accent)'  },
    success: { bg: 'var(--success-light)', icon: 'var(--success)' },
    danger:  { bg: 'var(--danger-light)',  icon: 'var(--danger)'  },
    warning: { bg: 'var(--warning-light)', icon: 'var(--warning)' },
  }

  const c = colors[color]
  const isPositiveTrend = trend >= 0

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 hover:shadow-[var(--shadow-md)] transition-shadow duration-200 flex flex-col gap-3 min-w-0">
      {/* Top row */}
      <div className="flex items-center justify-between gap-2">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: c.bg }}
        >
          <Icon size={18} style={{ color: c.icon }} />
        </div>
        {trend !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full flex-shrink-0',
            isPositiveTrend
              ? 'bg-[var(--success-light)] text-[var(--success)]'
              : 'bg-[var(--danger-light)] text-[var(--danger)]'
          )}>
            {isPositiveTrend ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div className="min-w-0">
        <p className="text-2xl font-bold text-[var(--text-primary)] tracking-tight truncate">
          {prefix}
          {animated.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          {suffix}
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{title}</p>
        {trendLabel && (
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{trendLabel}</p>
        )}
      </div>
    </div>
  )
}
