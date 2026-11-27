const DAY = 86400000

export const startOfDay = (d = new Date()) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

const pad = (n) => String(n).padStart(2, '0')

export const toISO = (d) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`
}

export const parseISO = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const todayISO = () => toISO(new Date())

export const addDays = (iso, n) => {
  const d = parseISO(iso)
  d.setDate(d.getDate() + n)
  return toISO(d)
}

export const addMonths = (iso, n) => {
  const d = parseISO(iso)
  const day = d.getDate()
  d.setMonth(d.getMonth() + n)
  if (d.getDate() !== day) d.setDate(0) // 31 Jan + 1 month => 28 Feb
  return toISO(d)
}

export const daysLeft = (iso) => Math.round((parseISO(iso) - startOfDay()) / DAY)

// 7 ya kam = expiring (orange), uske upar active (green), negative = expired (red)
export const getStatus = (endDate) => {
  const d = daysLeft(endDate)
  if (d < 0) return 'expired'
  if (d <= 7) return 'expiring'
  return 'active'
}

export const fmt = (iso) =>
  parseISO(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export const daysLabel = (endDate) => {
  const d = daysLeft(endDate)
  if (d < 0) return 'Expired'
  if (d === 0) return 'Ends today'
  if (d === 1) return '1 day left'
  return `${d} days left`
}

export const durationLabel = (months) => (months === 1 ? '1 month' : `${months} months`)
