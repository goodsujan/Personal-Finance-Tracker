import { cn } from '../../lib/utils'

export default function Card({ children, className, padding = true, ...props }) {
    return (
        <div
            className={cn(
                'bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl',
                'shadow-[var(--shadow-sm)]',
                padding && 'p-5',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}
