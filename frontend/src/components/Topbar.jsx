import { useLocation } from 'react-router-dom'
import { Menu, Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/budgets': 'Budgets',
  '/goals': 'Savings Goals',
  '/analytics': 'Analytics',
  '/profile': 'Profile',
}

export default function Topbar({ onMenuClick }) {
  const location = useLocation()
  const { user } = useAuth()
  const title = pageTitles[location.pathname] || 'FinTrack'

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-[var(--border)] bg-[var(--bg-card)]">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base font-semibold text-[var(--text-primary)]">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-xl hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] transition-colors relative">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2.5 pl-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--accent-light)' }}>
            <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
              {user?.username?.[0]?.toUpperCase()}
            </span>
          </div>
          <span className="text-sm font-medium text-[var(--text-primary)] hidden sm:block">
            {user?.username}
          </span>
        </div>
      </div>
    </header>
  )
}
