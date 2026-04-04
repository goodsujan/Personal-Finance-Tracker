import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '../../lib/utils'

const ToastContext = createContext(null)

const icons = {
    success: <CheckCircle size={16} />,
    error: <XCircle size={16} />,
    warning: <AlertCircle size={16} />,
    info: <Info size={16} />,
}

const styles = {
    success: 'border-[var(--success)] text-[var(--success)]',
    error: 'border-[var(--danger)]  text-[var(--danger)]',
    warning: 'border-[var(--warning)] text-[var(--warning)]',
    info: 'border-[var(--accent)]  text-[var(--accent)]',
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const toast = useCallback(({ message, type = 'info', duration = 3500 }) => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, duration)
    }, [])

    const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id))

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={cn(
                            'flex items-start gap-3 bg-[var(--bg-card)]',
                            'border-l-4 rounded-xl shadow-[var(--shadow-lg)]',
                            'px-4 py-3 animate-in slide-in-from-right',
                            styles[t.type]
                        )}
                    >
                        <span className="mt-0.5 flex-shrink-0">{icons[t.type]}</span>
                        <p className="text-sm text-[var(--text-primary)] flex-1">{t.message}</p>
                        <button
                            onClick={() => remove(t.id)}
                            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] flex-shrink-0"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export const useToast = () => useContext(ToastContext)
