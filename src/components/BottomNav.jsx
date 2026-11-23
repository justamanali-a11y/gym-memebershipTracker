import { Link, useLocation } from 'react-router-dom'
import { navFor } from './navItems'

// Sirf phone / tablet pe dikhta hai (laptop pe Sidebar aata hai)
export default function BottomNav({ role }) {
  const { pathname } = useLocation()
  return (
    <nav className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-[480px] -translate-x-1/2 border-t border-stone-200 bg-cream pb-2 pt-1.5 lg:hidden">
      {navFor(role).map(({ to, label, icon: Icon, active }) => (
        <Link
          key={to}
          to={to}
          className={`flex flex-1 flex-col items-center gap-0.5 py-1 text-[11px] ${
            active(pathname) ? 'font-medium text-brand' : 'text-stone-500'
          }`}
        >
          <Icon size={22} />
          {label}
        </Link>
      ))}
    </nav>
  )
}
