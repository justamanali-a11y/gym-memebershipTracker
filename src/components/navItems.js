import { BarChart3, CalendarCheck, Home, Menu, PlusCircle, RefreshCw, User, Users } from 'lucide-react'

// active(): detail pages (jaise /owner/members/3) pe bhi sahi tab highlight hota hai
export const OWNER_NAV = [
  { to: '/owner', label: 'Home', icon: Home, active: (p) => p === '/owner' },
  {
    to: '/owner/members',
    label: 'Members',
    icon: Users,
    active: (p) => p.startsWith('/owner/members') && p !== '/owner/members/new',
  },
  { to: '/owner/members/new', label: 'Add', icon: PlusCircle, active: (p) => p === '/owner/members/new' },
  { to: '/owner/reports', label: 'Reports', icon: BarChart3, active: (p) => p.startsWith('/owner/reports') },
  {
    to: '/owner/more',
    label: 'More',
    icon: Menu,
    active: (p) => ['/owner/more', '/owner/profile', '/owner/plans', '/owner/reminders'].some((x) => p.startsWith(x)),
  },
]

export const MEMBER_NAV = [
  { to: '/member', label: 'Home', icon: Home, active: (p) => p === '/member' },
  { to: '/member/attendance', label: 'Attendance', icon: CalendarCheck, active: (p) => p.startsWith('/member/attendance') },
  { to: '/member/renew', label: 'Renew', icon: RefreshCw, active: (p) => p.startsWith('/member/renew') },
  { to: '/member/profile', label: 'Profile', icon: User, active: (p) => p.startsWith('/member/profile') },
]

export const navFor = (role) => (role === 'owner' ? OWNER_NAV : MEMBER_NAV)
