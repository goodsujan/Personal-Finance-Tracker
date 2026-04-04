import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './components/ui/Toast'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budgets from './pages/Budgets'
import Goals from './pages/Goals'
import Analytics from './pages/Analytics'
import Profile from './pages/Profile'

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {[
                { path: '/dashboard', element: <Dashboard /> },
                { path: '/transactions', element: <Transactions /> },
                { path: '/budgets', element: <Budgets /> },
                { path: '/goals', element: <Goals /> },
                { path: '/analytics', element: <Analytics /> },
                { path: '/profile', element: <Profile /> },
              ].map(({ path, element }) => (
                <Route key={path} path={path} element={
                  <ProtectedRoute>
                    <Layout>{element}</Layout>
                  </ProtectedRoute>
                } />
              ))}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
