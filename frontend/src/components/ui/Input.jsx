import { cn } from '../../lib/utils'

export default function Input({
    label, error, hint, className,
    leftIcon, rightIcon, ...props
}) {
    return (
        <div className="space-y-1.5">
            {label && (
                <label className="block text-sm font-medium text-[var(--text-primary)]">
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                        {leftIcon}
                    </span>
                )}
                <input
                    className={cn(
                        'w-full bg-[var(--bg-primary)] border border-[var(--border)]',
                        'rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)]',
                        'placeholder:text-[var(--text-muted)]',
                        'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]',
                        'focus:border-transparent transition-all duration-150',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        leftIcon && 'pl-10',
                        rightIcon && 'pr-10',
                        error && 'border-[var(--danger)] focus:ring-[var(--danger)]',
                        className
                    )}
                    {...props}
                />
                {rightIcon && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                        {rightIcon}
                    </span>
                )}
            </div>
            {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
            {hint && !error && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
        </div>
    )
}
