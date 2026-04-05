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
    accent:  { bg: 'var(--accent-light)',   icon: 'var(--accent)',  text: 'var(--accent)'  },
    success: { bg: 'var(--success-light)',  icon: 'var(--success)', text: 'var(--success)' },
    danger:  { bg: 'var(--danger-light)',   icon: 'var(--danger)',  text: 'var(--danger)'  },
    warning: { bg: 'var(--warning-light)',  icon: 'var(--warning)', text: 'var(--warning)' },
  }

  const c = colors[color]
  const isPositiveTrend = trend >= 0

  return (
    <Card className="hover:shadow-[var(--shadow-md)] transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: c.bg }}
        >
          <Icon size={18} style={{ color: c.icon }} />
        </div>
        {trend !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
            isPositiveTrend
              ? 'bg-[var(--success-light)] text-[var(--success)]'
              : 'bg-[var(--danger-light)] text-[var(--danger)]'
          )}>
            {isPositiveTrend
              ? <TrendingUp size={11} />
              : <TrendingDown size={11} />
            }
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
        {prefix}
        {animated.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}
        {suffix}
      </p>
      <p className="text-xs text-[var(--text-muted)] mt-1">{title}</p>
      {trendLabel && (
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{trendLabel}</p>
      )}
    </Card>
  )
}
