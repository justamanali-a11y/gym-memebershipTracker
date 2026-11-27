import { Outlet } from 'react-router-dom'
import { useGym } from '../context/GymContext'

// Poori screen ka wrapper. Phone pe seedha, laptop pe Sidebar ke saath (RoleLayout mein)
export default function Frame() {
  const { toast } = useGym()
  return (
    <div className="relative min-h-screen w-full bg-cream">
      {toast && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-stone-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
      <Outlet />
    </div>
  )
}
