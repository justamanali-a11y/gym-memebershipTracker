import { Route, Routes } from 'react-router-dom'
import Frame from './layouts/Frame'
import RoleLayout from './layouts/RoleLayout'
import Login from './pages/Login'

import Dashboard from './pages/owner/Dashboard'
import Members from './pages/owner/Members'
import AddMember from './pages/owner/AddMember'
import MemberProfile from './pages/owner/MemberProfile'
import OwnerRenew from './pages/owner/Renew'
import Plans from './pages/owner/Plans'
import Reminders from './pages/owner/Reminders'
import Reports from './pages/owner/Reports'
import More from './pages/owner/More'
import OwnerProfile from './pages/owner/Profile'

import MemberHome from './pages/member/Home'
import Attendance from './pages/member/Attendance'
import MemberRenew from './pages/member/Renew'
import MemberProfilePage from './pages/member/Profile'

export default function App() {
  return (
    <Routes>
      <Route element={<Frame />}>
        <Route path="/" element={<Login />} />

        {/* Owner: bottom nav wale screens */}
        <Route path="/owner" element={<RoleLayout role="owner" />}>
          <Route index element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="reports" element={<Reports />} />
          <Route path="more" element={<More />} />
        </Route>

        {/* Owner: form / detail screens (bottom nav nahi) */}
        <Route path="/owner" element={<RoleLayout role="owner" nav={false} />}>
          <Route path="members/new" element={<AddMember />} />
          <Route path="members/:id" element={<MemberProfile />} />
          <Route path="members/:id/renew" element={<OwnerRenew />} />
          <Route path="profile" element={<OwnerProfile />} />
          <Route path="plans" element={<Plans />} />
          <Route path="reminders" element={<Reminders />} />
        </Route>

        {/* Member */}
        <Route path="/member" element={<RoleLayout role="member" />}>
          <Route index element={<MemberHome />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="profile" element={<MemberProfilePage />} />
        </Route>
        <Route path="/member" element={<RoleLayout role="member" nav={false} />}>
          <Route path="renew" element={<MemberRenew />} />
        </Route>

        <Route path="*" element={<Login />} />
      </Route>
    </Routes>
  )
}
