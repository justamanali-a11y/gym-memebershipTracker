import { Navigate, Outlet } from 'react-router-dom'
import { useGym } from '../context/GymContext'
import BottomNav from '../components/BottomNav'
import Sidebar from '../components/Sidebar'

// Phone: bottom nav (nav=true) ya sirf content (form/detail screens)
// Laptop: left sidebar + chauda content
export default function RoleLayout({ role, nav = true }) {
  const { role: current, loading } = useGym()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-stone-500">Loading...</div>
    )
  }
  if (current !== role) return <Navigate to="/" replace />

  const width = role === 'owner' && nav ? 'lg:max-w-5xl' : 'lg:max-w-2xl'

  return (
    <div className="lg:flex">
      <Sidebar role={role} />
      <main className={`mx-auto w-full min-w-0 max-w-[480px] lg:px-6 ${width} ${nav ? 'pb-24' : 'pb-28'} lg:pb-10`}>
        <Outlet />
      </main>
      {nav && <BottomNav role={role} />}
    </div>
  )
}
