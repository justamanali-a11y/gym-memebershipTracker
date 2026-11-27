import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Search } from 'lucide-react'
import { useGym } from '../../context/GymContext'
import { Avatar, Card, EmptyState, StatusPill } from '../../components/ui'
import { getStatus } from '../../lib/dates'

const FILTERS = [
  ['all', 'All'],
  ['active', 'Active'],
  ['expiring', 'Expiring'],
  ['expired', 'Expired'],
]

export default function Members() {
  const { members, planOf } = useGym()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return members.filter((m) => {
      const s = getStatus(m.endDate)
      const matchFilter = filter === 'all' || s === filter
      const matchQuery = !q || m.name.toLowerCase().includes(q) || m.phone.includes(q)
      return matchFilter && matchQuery
    })
  }, [members, query, filter])

  return (
    <div className="px-4 pt-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Members</h1>
          <p className="text-sm text-stone-500">{members.length} people in your gym</p>
        </div>
        <button
          onClick={() => navigate('/owner/members/new')}
          className="rounded-lg bg-brand px-3 py-2 text-xs font-medium text-white"
        >
          + Add member
        </button>
      </div>

      <div className="relative mt-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or phone"
          className="h-11 w-full rounded-xl border border-stone-300 bg-white pl-10 pr-3 text-[15px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(([k, label]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`rounded-full px-4 py-2 text-sm ${
              filter === k ? 'bg-white font-medium shadow-sm' : 'bg-stone-200/70 text-stone-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Card className="mt-3">
        {list.length === 0 ? (
          <EmptyState title="Koi member nahi mila" text="Search ya filter badal ke dekhein." />
        ) : (
          list.map((m, i) => (
            <div
              key={m.id}
              onClick={() => navigate(`/owner/members/${m.id}`)}
              className={`flex cursor-pointer items-center gap-3 p-4 ${i > 0 ? 'border-t border-stone-100' : ''}`}
            >
              <Avatar name={m.name} photo={m.photo} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{m.name}</div>
                <div className="text-sm text-stone-500">{planOf(m.planId)?.name} plan</div>
              </div>
              <StatusPill endDate={m.endDate} />
              <ChevronRight size={18} className="text-stone-400" />
            </div>
          ))
        )}
      </Card>
    </div>
  )
}
