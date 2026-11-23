import { useNavigate } from 'react-router-dom'
import { Check, ChevronLeft } from 'lucide-react'
import { daysLabel, durationLabel, getStatus } from '../lib/dates'

export const initials = (name) =>
  name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export function Avatar({ name, photo, size = 40 }) {
  const style = { width: size, height: size, fontSize: size * 0.36 }
  if (photo) return <img src={photo} alt={name} style={style} className="shrink-0 rounded-full object-cover" />
  return (
    <div
      style={style}
      className="flex shrink-0 items-center justify-center rounded-full bg-brand-soft font-semibold text-brand-dark"
    >
      {initials(name)}
    </div>
  )
}

const PILL = {
  active: 'bg-emerald-100 text-emerald-800',
  expiring: 'bg-amber-100 text-amber-800',
  expired: 'bg-red-100 text-red-700',
}

export function StatusPill({ endDate }) {
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${PILL[getStatus(endDate)]}`}>
      {daysLabel(endDate)}
    </span>
  )
}

export function Card({ className = '', children, ...rest }) {
  return (
    <div className={`rounded-2xl border border-stone-200/80 bg-white shadow-sm ${className}`} {...rest}>
      {children}
    </div>
  )
}

export function TopBar({ title, subtitle, back = true, right }) {
  const navigate = useNavigate()
  return (
    <div className="px-4 pb-2 pt-5">
      <div className="flex items-center gap-2">
        {back && (
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full active:bg-stone-200/60"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        <h1 className="flex-1 text-xl font-semibold">{title}</h1>
        {right}
      </div>
      {subtitle && <p className={`text-sm text-stone-500 ${back ? 'ml-8' : ''}`}>{subtitle}</p>}
    </div>
  )
}

// Neeche chipakne wala button bar (dono taraf 16px padding)
export function StickyBar({ children }) {
  return (
    <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 border-t border-stone-200 bg-cream px-4 pb-4 pt-3 lg:static lg:max-w-md lg:translate-x-0 lg:border-0 lg:bg-transparent lg:pb-0 lg:pt-6">
      <div className="flex gap-3">{children}</div>
    </div>
  )
}

export function Button({ variant = 'primary', className = '', children, ...rest }) {
  const base =
    'flex h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-[15px] font-medium transition active:scale-[0.98] disabled:opacity-50'
  const styles = {
    primary: 'bg-brand text-white',
    outline: 'border border-stone-300 bg-white text-stone-800',
    soft: 'bg-brand-soft text-brand-dark',
  }
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...rest}>
      {children}
    </button>
  )
}

export function Toggle({ on, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? 'bg-brand' : 'bg-stone-300'}`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`}
      />
    </button>
  )
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-stone-700">{label}</span>
      {children}
    </label>
  )
}

export const inputClass =
  'h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-[15px] outline-none placeholder:text-stone-400 focus:border-brand focus:ring-2 focus:ring-brand/20'

export function PlanCard({ plan, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(plan.id)}
      className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
        selected ? 'border-brand bg-brand-soft' : 'border-stone-200 bg-white'
      }`}
    >
      <div>
        <div className="font-semibold">{plan.name}</div>
        <div className="text-sm text-stone-600">Rs {plan.price.toLocaleString('en-IN')}</div>
        <div className="mt-0.5 text-xs text-stone-500">{durationLabel(plan.months)}</div>
      </div>
      {selected ? (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white">
          <Check size={14} strokeWidth={3} />
        </span>
      ) : (
        <span className="h-6 w-6 rounded-full border-2 border-stone-300" />
      )}
    </button>
  )
}

export function PayToggle({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 rounded-xl bg-stone-200/70 p-1 text-sm font-medium">
      {['Cash', 'UPI'].map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`h-10 rounded-lg transition ${value === m ? 'bg-white shadow-sm' : 'text-stone-500'}`}
        >
          {m}
        </button>
      ))}
    </div>
  )
}

// Dummy QR (asli nahi). Baad mein UPI QR library se replace karna
export function QRCode({ seed = 'gymflow', size = 120 }) {
  const n = 9
  let h = 0
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0
  const cells = []
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const finder = (x < 3 && y < 3) || (x > n - 4 && y < 3) || (x < 3 && y > n - 4)
      h = (h * 1103515245 + 12345) >>> 0
      if (finder || (h >> 16) % 2 === 0) cells.push([x, y])
    }
  }
  return (
    <div className="inline-block rounded-xl border border-stone-200 bg-white p-2">
      <svg width={size} height={size} viewBox={`0 0 ${n} ${n}`}>
        {cells.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="0.92" height="0.92" rx="0.15" fill="#14352f" />
        ))}
      </svg>
    </div>
  )
}

export function PayPanel({ mode, amount, received, setReceived, seed }) {
  if (mode === 'UPI') {
    return (
      <div className="flex flex-col items-center gap-2 py-2">
        <QRCode seed={seed} size={120} />
        <p className="text-center text-sm text-stone-600">Scan to pay Rs {amount.toLocaleString('en-IN')}</p>
      </div>
    )
  }
  return (
    <label className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4">
      <input
        type="checkbox"
        checked={received}
        onChange={(e) => setReceived(e.target.checked)}
        className="h-5 w-5 accent-teal-700"
      />
      <span className="text-sm font-medium">Payment received</span>
    </label>
  )
}

export function SuccessScreen({ title, line, buttonLabel, onDone }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 pb-24 text-center lg:min-h-[80vh] lg:pb-0">
      <div className="pop mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Check size={38} strokeWidth={2.5} />
      </div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-stone-500">{line}</p>
      <StickyBar>
        <Button onClick={onDone}>{buttonLabel}</Button>
      </StickyBar>
    </div>
  )
}

export function EmptyState({ title, text }) {
  return (
    <div className="py-10 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-stone-500">{text}</p>
    </div>
  )
}
