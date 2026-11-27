import { addDays, addMonths, todayISO, parseISO, toISO } from '../lib/dates'

// [naam, phone, planId, kitne din mein expire (negative = ho chuka)]
const seeds = [
  ['Riya Sharma', '9876543210', 'quarterly', 4],
  ['Kabir Mehta', '9876500001', 'monthly', 6],
  ['Neha Iyer', '9876500002', 'yearly', 2],
  ['Arjun Rao', '9876500003', 'monthly', -3],
  ['Meera Joshi', '9876500004', 'quarterly', 18],
  ['Vikram Singh', '9876500005', 'monthly', 1],
  ['Ananya Gupta', '9876500006', 'yearly', 210],
  ['Rohan Verma', '9876500007', 'quarterly', 45],
  ['Pooja Nair', '9876500008', 'monthly', 12],
  ['Siddharth Jain', '9876500009', 'quarterly', -12],
]

function sampleAttendance() {
  const today = parseISO(todayISO())
  const days = []
  for (let d = 1; d <= today.getDate(); d++) {
    if ((d * 7) % 3 !== 0) days.push(toISO(new Date(today.getFullYear(), today.getMonth(), d)))
  }
  return days
}

// Testing ke liye sample members (More screen se load hote hain). plans = gym ke plans
export function sampleMembers(plans) {
  const today = todayISO()
  return seeds.map(([name, phone, planId, off], i) => {
    const plan = plans.find((p) => p.id === planId) ?? plans[0]
    const endDate = addDays(today, off)
    const startDate = addMonths(endDate, -plan.months)
    return {
      name,
      phone,
      email: '',
      photo: null,
      planId: plan.id,
      startDate,
      endDate,
      payments: [0, 1, 2].map((k) => ({
        date: addMonths(startDate, -plan.months * k),
        amount: plan.price,
        mode: k % 2 === 0 ? 'UPI' : 'Cash',
      })),
      attendance: i === 0 ? sampleAttendance() : [],
    }
  })
}
