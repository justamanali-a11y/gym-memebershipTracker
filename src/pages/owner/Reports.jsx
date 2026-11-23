import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card } from '../../components/ui'

// Abhi dummy data. Firebase aane ke baad payments se calculate hoga.
const REVENUE = [52400, 61800, 58200, 70500, 77300, 84200]
const NEW = [9, 11, 8, 12, 13, 14]
const RENEWED = [18, 22, 20, 27, 29, 31]

export default function Reports() {
  const [idx, setIdx] = useState(5)

  const months = useMemo(() => {
    const now = new Date()
    return REVENUE.map((_, i) => new Date(now.getFullYear(), now.getMonth() - (5 - i), 1))
  }, [])

  const label = (d, long) =>
    d.toLocaleDateString('en-IN', long ? { month: 'long', year: 'numeric' } : { month: 'short' })
  const max = Math.max(...REVENUE)

  return (
    <div className="px-4 pt-5">
      <h1 className="text-2xl font-semibold">Reports</h1>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-stone-200 bg-white p-1">
        <button
          disabled={idx === 0}
          onClick={() => setIdx(idx - 1)}
          aria-label="Previous month"
          className="flex h-10 w-10 items-center justify-center rounded-lg disabled:opacity-30"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="font-medium">{label(months[idx], true)}</span>
        <button
          disabled={idx === 5}
          onClick={() => setIdx(idx + 1)}
          aria-label="Next month"
          className="flex h-10 w-10 items-center justify-center rounded-lg disabled:opacity-30"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 lg:gap-4">
        <Card className="col-span-3 p-4 lg:col-span-1">
          <div className="text-sm text-stone-500">Revenue</div>
          <div className="mt-1 text-3xl font-semibold">Rs {REVENUE[idx].toLocaleString('en-IN')}</div>
        </Card>
        <Card className="col-span-3 grid grid-cols-2 divide-x divide-stone-100 p-4 lg:col-span-2">
          <div>
            <div className="text-sm text-stone-500">New members</div>
            <div className="mt-1 text-2xl font-semibold">{NEW[idx]}</div>
          </div>
          <div className="pl-4">
            <div className="text-sm text-stone-500">Renewals</div>
            <div className="mt-1 text-2xl font-semibold">{RENEWED[idx]}</div>
          </div>
        </Card>
      </div>

      <Card className="mt-4 p-4">
        <h2 className="mb-4 font-semibold">Revenue, last 6 months</h2>
        <div className="flex h-40 items-end gap-3">
          {REVENUE.map((v, i) => (
            <button key={i} onClick={() => setIdx(i)} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <div
                className={`w-full rounded-t-lg transition ${i === idx ? 'bg-brand' : 'bg-brand/30'}`}
                style={{ height: `${(v / max) * 100}%` }}
              />
              <span className={`text-[11px] ${i === idx ? 'font-medium text-brand' : 'text-stone-500'}`}>
                {label(months[i])}
              </span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}
