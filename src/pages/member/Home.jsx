import { Check } from 'lucide-react'
import { useGym } from '../../context/GymContext'
import { Button, Card } from '../../components/ui'
import { daysLeft, fmt, getStatus, todayISO } from '../../lib/dates'

const COLORS = { active: '#0f766e', expiring: '#d97706', expired: '#dc2626' }

function Ring({ value, total, color, children }) {
  const r = 52
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(1, value / total))
  return (
    <div className="relative h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e7e5e4" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}

export default function MemberHome() {
  const { members, meId, planOf, checkIn, showToast } = useGym()
  const me = members.find((m) => m.id === meId) ?? members[0]
  const plan = planOf(me.planId)
  const left = daysLeft(me.endDate)
  const status = getStatus(me.endDate)
  const checked = me.attendance.includes(todayISO())

  return (
    <div className="px-4 pt-5">
      <p className="text-sm text-stone-500">Welcome back</p>
      <h1 className="mb-5 text-2xl font-semibold">Hi {me.name.split(' ')[0]}</h1>

      <Card className="flex flex-col items-center p-6">
        <Ring value={left} total={(plan?.months ?? 1) * 30} color={COLORS[status]}>
          <span className="text-3xl font-semibold">{Math.max(left, 0)}</span>
          <span className="text-xs text-stone-500">days left</span>
        </Ring>
        <div className="mt-4 text-lg font-semibold">{plan?.name} plan</div>
        <div className="text-sm text-stone-500">
          {left < 0 ? 'Expired on' : 'Expires on'} {fmt(me.endDate)}
        </div>
      </Card>

      <div className="mt-5">
        <Button
          disabled={checked || left < 0}
          onClick={async () => {
            try {
              await checkIn(me.id)
              showToast('Check-in ho gaya. Great workout!')
            } catch (err) {
              showToast(`Save nahi hua: ${err.code ?? err.message}`)
            }
          }}
          className="!h-14 !text-base"
        >
          {checked ? (
            <>
              <Check size={18} /> Checked in today
            </>
          ) : (
            'Check in'
          )}
        </Button>
      </div>
    </div>
  )
}
