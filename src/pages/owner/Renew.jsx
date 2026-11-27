import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGym } from '../../context/GymContext'
import { Button, EmptyState, PayPanel, PayToggle, PlanCard, StickyBar, SuccessScreen, TopBar } from '../../components/ui'
import { fmt } from '../../lib/dates'

export default function Renew() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { members, plans, planOf, renewMember, showToast } = useGym()
  const m = members.find((x) => x.id === id)

  const [planId, setPlanId] = useState(m?.planId ?? plans[0].id)
  const [mode, setMode] = useState('UPI')
  const [received, setReceived] = useState(false)
  const [done, setDone] = useState(null)
  const [saving, setSaving] = useState(false)

  if (!m) return <EmptyState title="Member nahi mila" text="" />
  const plan = planOf(planId)

  if (done) {
    return (
      <SuccessScreen
        title="Membership renewed!"
        line={`${done.name} · ${plan.name} · Ends ${fmt(done.endDate)}`}
        buttonLabel="Back to members"
        onDone={() => navigate('/owner/members', { replace: true })}
      />
    )
  }

  const confirm = async () => {
    setSaving(true)
    try {
      setDone(await renewMember(m.id, planId, mode))
      showToast('Membership renew ho gayi')
    } catch (err) {
      showToast(`Save nahi hua: ${err.code ?? err.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <TopBar title="Renew membership" subtitle={m.name} />
      <div className="space-y-3 px-4">
        {plans.map((p) => (
          <PlanCard key={p.id} plan={p} selected={p.id === planId} onSelect={setPlanId} />
        ))}
        <div className="pt-2">
          <PayToggle value={mode} onChange={setMode} />
        </div>
        <PayPanel mode={mode} amount={plan.price} received={received} setReceived={setReceived} seed={m.id + planId} />
      </div>
      <StickyBar>
        <Button disabled={saving || (mode === 'Cash' && !received)} onClick={confirm}>
          Confirm renewal
        </Button>
      </StickyBar>
    </div>
  )
}
