import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGym } from '../../context/GymContext'
import { Button, PlanCard, StickyBar, SuccessScreen, TopBar } from '../../components/ui'
import { fmt } from '../../lib/dates'

export default function MemberRenew() {
  const { members, meId, plans, planOf, renewMember, showToast } = useGym()
  const navigate = useNavigate()
  const me = members.find((m) => m.id === meId) ?? members[0]
  const [planId, setPlanId] = useState(me.planId)
  const [done, setDone] = useState(null)

  if (done) {
    return (
      <SuccessScreen
        title="Membership renewed!"
        line={`${planOf(planId).name} · Ends ${fmt(done.endDate)}`}
        buttonLabel="Back to home"
        onDone={() => navigate('/member', { replace: true })}
      />
    )
  }

  return (
    <div>
      <TopBar title="Renew membership" />
      <div className="space-y-3 px-4">
        {plans.map((p) => (
          <PlanCard key={p.id} plan={p} selected={p.id === planId} onSelect={setPlanId} />
        ))}
        <p className="px-1 text-sm text-stone-500">UPI se pay karne ke baad membership turant renew ho jayegi.</p>
      </div>
      <StickyBar>
        <Button
          onClick={async () => {
            try {
              setDone(await renewMember(me.id, planId, 'UPI'))
              showToast('Payment ho gaya')
            } catch (err) {
              showToast(`Save nahi hua: ${err.code ?? err.message}`)
            }
          }}
        >
          Pay via UPI
        </Button>
      </StickyBar>
    </div>
  )
}
