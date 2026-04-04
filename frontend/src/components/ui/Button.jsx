import { cn } from '../../lib/utils'

const variants = {
    primary: 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white',
    secondary: 'bg-[var(--bg-tertiary)] hover:bg-[var(--border)] text-[var(--text-primary)]',
    danger: 'bg-[var(--danger)] hover:opacity-90 text-white',
    ghost: 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]',
    outline: 'border border-[var(--border)] hover:border-[var(--border-hover)] text-[var(--text-primary)] bg-transparent',
}

const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-5 py-2.5 text-sm rounded-xl',
    xl: 'px-6 py-3 text-base rounded-xl',
    icon: 'p-2 rounded-xl',
}

export default function Button({
    children, variant = 'primary', size = 'md',
    className, disabled, loading, onClick, type = 'button', ...props
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={cn(
                'inline-flex items-center justify-center gap-2 font-medium',
                'transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
                'focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2',
                'focus:ring-offset-[var(--bg-primary)]',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {loading && (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {children}
        </button>
    )
}
