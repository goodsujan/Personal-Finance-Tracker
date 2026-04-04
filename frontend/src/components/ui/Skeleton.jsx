import { cn } from '../../lib/utils'

export function Skeleton({ className }) {
    return (
        <div className={cn(
            'animate-pulse rounded-xl bg-[var(--bg-tertiary)]',
            className
        )} />
    )
}

export function StatCardSkeleton() {
    return (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
            <div className="flex justify-between mb-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-20" />
        </div>
    )
}

export function TableRowSkeleton({ cols = 4 }) {
    return (
        <tr className="border-b border-[var(--border)]">
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-5 py-4">
                    <Skeleton className="h-4 w-full" />
                </td>
            ))}
        </tr>
    )
}
