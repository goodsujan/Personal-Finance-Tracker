import { useLocation } from 'react-router-dom'
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
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6">
      {/* Left — hamburger + title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <div className="space-y-1.5">
            <span className="block w-5 h-0.5 bg-gray-600" />
            <span className="block w-5 h-0.5 bg-gray-600" />
            <span className="block w-5 h-0.5 bg-gray-600" />
          </div>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>

      {/* Right — greeting */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 hidden sm:block">
          Hello, <span className="font-medium text-gray-800">{user?.username}</span>
        </span>
        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
          <span className="text-indigo-600 text-sm font-semibold">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </span>
        </div>
      </div>
    </header>
  )
}
