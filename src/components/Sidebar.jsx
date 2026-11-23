import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Dumbbell, LogOut } from 'lucide-react'
import { useGym } from '../context/GymContext'
import { navFor } from './navItems'

// Sirf laptop (lg: 1024px+) pe dikhta hai
export default function Sidebar({ role }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { gym, logout } = useGym()

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-stone-200 bg-white/70 p-4 lg:flex">
      <div className="mb-6 flex items-center gap-3 px-2 pt-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white">
          <Dumbbell size={20} />
        </div>
        <div>
          <div className="font-semibold leading-tight">GymFlow</div>
          <div className="text-xs text-stone-500">{gym.name}</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navFor(role).map(({ to, label, icon: Icon, active }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] ${
              active(pathname) ? 'bg-brand-soft font-medium text-brand-dark' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Icon size={20} />
            {label === 'Add' ? 'Add member' : label}
          </Link>
        ))}
      </nav>

      <button
        onClick={async () => {
          await logout()
          navigate('/', { replace: true })
        }}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] text-stone-600 hover:bg-stone-100"
      >
        <LogOut size={20} /> Logout
      </button>
    </aside>
  )
}
