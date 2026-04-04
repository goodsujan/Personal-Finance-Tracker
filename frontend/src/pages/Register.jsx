import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Wallet } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Register() {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      toast({ message: 'Passwords do not match.', type: 'error' })
      return
    }
    if (form.password.length < 8) {
      toast({ message: 'Password must be at least 8 characters.', type: 'error' })
      return
    }
    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      toast({ message: 'Account created! Welcome to FinTrack.', type: 'success' })
      navigate('/dashboard')
    } catch (err) {
      const data = err.response?.data
      const msg = data
        ? Object.values(data).flat()[0]
        : 'Registration failed. Please try again.'
      toast({ message: msg, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-secondary)' }}>
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--accent)' }}>
            <Wallet size={24} color="white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Create account</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Start tracking your finances today
          </p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 shadow-[var(--shadow-md)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Username" type="text" required
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="johndoe"
              leftIcon={<User size={16} />}
            />
            <Input label="Email address" type="email" required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              leftIcon={<Mail size={16} />}
            />
            <Input label="Password" type="password" required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Min. 8 characters"
              leftIcon={<Lock size={16} />}
              hint="Must be at least 8 characters"
            />
            <Input label="Confirm password" type="password" required
              value={form.confirm}
              onChange={e => setForm({ ...form, confirm: e.target.value })}
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
            />
            <Button type="submit" size="lg" loading={loading} className="w-full">
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-6">
            Already have an account?{' '}
            <Link to="/login"
              className="font-medium hover:underline"
              style={{ color: 'var(--accent)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
