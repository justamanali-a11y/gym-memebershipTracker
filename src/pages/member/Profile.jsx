import { useNavigate } from 'react-router-dom'
import { LogOut, MessageCircle } from 'lucide-react'
import { useGym } from '../../context/GymContext'
import { Avatar, Button, Card } from '../../components/ui'
import { openWhatsApp } from '../../lib/whatsapp'

export default function MemberProfilePage() {
  const { members, meId, gym, logout } = useGym()
  const navigate = useNavigate()
  const me = members.find((m) => m.id === meId) ?? members[0]

  return (
    <div className="px-4 pt-5">
      <h1 className="mb-5 text-2xl font-semibold">Profile</h1>

      <div className="mb-5 flex flex-col items-center">
        <Avatar name={me.name} photo={me.photo} size={80} />
        <div className="mt-3 text-lg font-semibold">{me.name}</div>
        <div className="text-sm text-stone-500">+91 {me.phone}</div>
      </div>

      <Card className="mb-5 space-y-3 p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-stone-500">Gym</span>
          <span className="font-medium">{gym.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-500">Timings</span>
          <span className="font-medium">{gym.timings}</span>
        </div>
      </Card>

      <Button onClick={() => openWhatsApp(gym.phone, `Hi, main ${me.name} hoon.`)}>
        <MessageCircle size={16} /> Contact gym
      </Button>

      <button
        onClick={async () => {
          await logout()
          navigate('/', { replace: true })
        }}
        className="mt-5 flex w-full items-center justify-center gap-2 text-sm text-stone-500"
      >
        <LogOut size={16} /> Logout
      </button>
    </div>
  )
}
