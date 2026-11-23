import { useGym } from '../../context/GymContext'
import { Card } from '../../components/ui'
import { toISO, todayISO } from '../../lib/dates'

const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function Attendance() {
  const { members, meId } = useGym()
  const me = members.find((m) => m.id === meId) ?? members[0]

  const now = new Date()
  const y = now.getFullYear()
  const mo = now.getMonth()
  const total = new Date(y, mo + 1, 0).getDate()
  const offset = (new Date(y, mo, 1).getDay() + 6) % 7 // Monday se shuru
  const today = todayISO()

  const monthKey = `${y}-${String(mo + 1).padStart(2, '0')}`
  const attended = me.attendance.filter((d) => d.startsWith(monthKey)).length

  const cells = [...Array(offset).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)]

  return (
    <div className="px-4 pt-5">
      <h1 className="text-2xl font-semibold">Attendance</h1>
      <p className="mb-4 text-sm text-stone-500">
        {now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
      </p>

      <Card className="p-4">
        <div className="mb-2 grid grid-cols-7 text-center text-xs text-stone-400">
          {WEEK.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-2 text-center text-sm">
          {cells.map((d, i) => {
            if (!d) return <span key={i} />
            const iso = toISO(new Date(y, mo, d))
            const on = me.attendance.includes(iso)
            return (
              <span
                key={i}
                className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full ${
                  on ? 'bg-brand font-medium text-white' : 'text-stone-700'
                } ${iso === today && !on ? 'ring-1 ring-brand' : ''}`}
              >
                {d}
              </span>
            )
          })}
        </div>
      </Card>

      <p className="mt-4 text-center text-sm font-medium text-stone-700">{attended} days this month</p>
    </div>
  )
}
