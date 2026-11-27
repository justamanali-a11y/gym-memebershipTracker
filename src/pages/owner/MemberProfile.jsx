import { useNavigate, useParams } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { useGym } from '../../context/GymContext'
import { Avatar, Button, Card, EmptyState, StatusPill, StickyBar, TopBar } from '../../components/ui'
import { fmt } from '../../lib/dates'
import { fillTemplate, openWhatsApp } from '../../lib/whatsapp'

export default function MemberProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { members, planOf, reminders, showToast } = useGym()
  const m = members.find((x) => x.id === id)

  if (!m) {
    return (
      <>
        <TopBar title="Member profile" />
        <EmptyState title="Member nahi mila" text="Ho sakta hai ye delete ho gaya ho." />
      </>
    )
  }

  const plan = planOf(m.planId)

  const remind = () => {
    openWhatsApp(m.phone, fillTemplate(reminders.message, m))
    showToast('Reminder ke liye WhatsApp khul raha hai')
  }

  return (
    <div>
      <TopBar title="Member profile" />

      <div className="px-4">
        <div className="mb-4 flex items-center gap-3 py-2">
          <Avatar name={m.name} photo={m.photo} size={48} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-lg font-semibold">{m.name}</div>
            <div className="text-sm text-stone-500">+91 {m.phone}</div>
          </div>
          <StatusPill endDate={m.endDate} />
        </div>

        <Card className="mb-4 space-y-3 p-4 text-sm">
          {[
            ['Plan', plan?.name],
            ['Start date', fmt(m.startDate)],
            ['End date', fmt(m.endDate)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-stone-500">{k}</span>
              <span className="font-medium">{v}</span>
            </div>
          ))}
        </Card>

        <Card className="p-4">
          <h2 className="mb-2 font-semibold">Payment history</h2>
          {[...m.payments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6).map((p, i) => (
            <div key={i} className={`flex items-center justify-between py-3 text-sm ${i > 0 ? 'border-t border-stone-100' : ''}`}>
              <div>
                <div className="font-medium">{fmt(p.date)}</div>
                <div className="text-xs text-stone-500">{p.mode}</div>
              </div>
              <span className="font-medium">Rs {p.amount.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </Card>
      </div>

      <StickyBar>
        <Button className="!w-28 shrink-0" onClick={() => navigate(`/owner/members/${m.id}/renew`)}>
          Renew
        </Button>
        <Button variant="outline" className="whitespace-nowrap" onClick={remind}>
          <MessageCircle size={16} /> WhatsApp reminder
        </Button>
      </StickyBar>
    </div>
  )
}
