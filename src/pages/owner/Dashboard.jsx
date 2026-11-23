import { useNavigate } from 'react-router-dom'
import { Bell, Clock, LogIn, MessageCircle, UserCheck, UserX, ChevronRight } from 'lucide-react'
import { useGym } from '../../context/GymContext'
import { Avatar, Card, EmptyState, StatusPill } from '../../components/ui'
import { daysLabel, daysLeft, getStatus } from '../../lib/dates'
import { fillTemplate, openWhatsApp } from '../../lib/whatsapp'

function Stat({ label, value, icon: Icon, tone }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <span className="text-sm text-stone-600">{label}</span>
        <Icon size={20} className={tone} />
      </div>
      <div className="mt-3 text-3xl font-semibold">{value}</div>
    </Card>
  )
}

export default function Dashboard() {
  const { members, gym, reminders, planOf, showToast } = useGym()
  const navigate = useNavigate()

  const count = (s) => members.filter((m) => getStatus(m.endDate) === s).length
  const callList = members
    .filter((m) => daysLeft(m.endDate) <= 7)
    .sort((a, b) => daysLeft(a.endDate) - daysLeft(b.endDate))
    .slice(0, 5)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const remind = (e, m) => {
    e.stopPropagation()
    openWhatsApp(m.phone, fillTemplate(reminders.message, m))
    showToast('WhatsApp khul raha hai')
  }

  return (
    <div className="px-4 pt-5">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-sm text-stone-500">
            {greeting}, {gym.owner}
          </p>
          <h1 className="text-2xl font-semibold leading-tight">Your gym, at a glance</h1>
        </div>
        <button
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white"
        >
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Stat label="Active" value={count('active') + count('expiring')} icon={UserCheck} tone="text-brand" />
        <Stat label="Expiring in 7 days" value={count('expiring')} icon={Clock} tone="text-amber-600" />
        <Stat label="Expired" value={count('expired')} icon={UserX} tone="text-red-500" />
        <Stat label="Today's check-ins" value={34} icon={LogIn} tone="text-brand" />
      </div>

      <h2 className="mt-7 text-lg font-semibold">Call today</h2>
      <p className="mb-3 text-sm text-stone-500">Keep the conversation going</p>

      <Card>
        {callList.length === 0 ? (
          <EmptyState title="No calls for today" text="Sab members up to date hain." />
        ) : (
          callList.map((m, i) => (
            <div
              key={m.id}
              onClick={() => navigate(`/owner/members/${m.id}`)}
              className={`flex cursor-pointer items-center gap-3 p-4 ${i > 0 ? 'border-t border-stone-100' : ''}`}
            >
              <Avatar name={m.name} photo={m.photo} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{m.name}</div>
                <div className="truncate text-sm text-stone-500">
                  {planOf(m.planId)?.name} plan · {daysLabel(m.endDate).toLowerCase()}
                </div>
              </div>
              <button
                onClick={(e) => remind(e, m)}
                className="flex items-center gap-1 rounded-lg bg-brand-soft px-2.5 py-1.5 text-xs font-medium text-brand-dark"
              >
                <MessageCircle size={14} /> WhatsApp
              </button>
              <ChevronRight size={18} className="text-stone-400" />
            </div>
          ))
        )}
      </Card>
    </div>
  )
}
