import { cn } from '../../lib/utils'

const variants = {
    success: 'bg-[var(--success-light)] text-[var(--success)]',
    danger: 'bg-[var(--danger-light)]  text-[var(--danger)]',
    warning: 'bg-[var(--warning-light)] text-[var(--warning)]',
    accent: 'bg-[var(--accent-light)]  text-[var(--accent)]',
    default: 'bg-[var(--bg-tertiary)]   text-[var(--text-secondary)]',
}

export default function Badge({ children, variant = 'default', className }) {
    return (
        <span className={cn(
            'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
            variants[variant], className
        )}>
            {children}
        </span>
    )
}
