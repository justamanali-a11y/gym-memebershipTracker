import { useNavigate } from 'react-router-dom'
import { Bell, ChevronRight, Clock, Dumbbell, HelpCircle, LogOut, Tag, User } from 'lucide-react'
import { useGym } from '../../context/GymContext'
import { Card } from '../../components/ui'

export default function More() {
  const { gym, members, logout, showToast, seedDemo } = useGym()
  const navigate = useNavigate()

  const rows = [
    { icon: User, label: 'Profile', onClick: () => navigate('/owner/profile') },
    { icon: Tag, label: 'Plans', onClick: () => navigate('/owner/plans') },
    { icon: Bell, label: 'Reminders', onClick: () => navigate('/owner/reminders') },
    { icon: Clock, label: 'Gym timings', onClick: () => navigate('/owner/profile') },
    { icon: HelpCircle, label: 'Help', onClick: () => showToast('Jaldi aa raha hai') },
    {
      icon: LogOut,
      label: 'Logout',
      onClick: async () => {
        await logout()
        navigate('/', { replace: true })
      },
    },
  ]

  return (
    <div className="px-4 pt-5">
      <h1 className="mb-4 text-2xl font-semibold">More</h1>

      <Card className="mb-4 flex cursor-pointer items-center gap-3 p-4" onClick={() => navigate('/owner/profile')}>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <Dumbbell size={22} />
        </div>
        <div>
          <div className="font-semibold">{gym.name}</div>
          <div className="text-sm text-stone-500">
            {gym.owner}{gym.city ? ` · ${gym.city}` : ''}
          </div>
        </div>
      </Card>

      <Card>
        {rows.map(({ icon: Icon, label, onClick }, i) => (
          <button
            key={label}
            onClick={onClick}
            className={`flex w-full items-center gap-3 p-4 text-left ${i > 0 ? 'border-t border-stone-100' : ''}`}
          >
            <Icon size={20} className="text-stone-500" />
            <span className="flex-1 font-medium">{label}</span>
            <ChevronRight size={18} className="text-stone-400" />
          </button>
        ))}
      </Card>

      {members.length === 0 && (
        <button
          onClick={async () => {
            try {
              await seedDemo()
              showToast('10 sample members add ho gaye')
            } catch (err) {
              showToast(`Save nahi hua: ${err.code ?? err.message}`)
            }
          }}
          className="mt-6 w-full text-center text-sm text-brand"
        >
          Testing ke liye 10 sample members add karein
        </button>
      )}
    </div>
  )
}
