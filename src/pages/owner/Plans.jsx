import { useState } from 'react'
import { useGym } from '../../context/GymContext'
import { Button, Card, Field, StickyBar, TopBar, inputClass } from '../../components/ui'
import { durationLabel } from '../../lib/dates'

function PlanSheet({ plan, onClose, onSave }) {
  const [name, setName] = useState(plan.name)
  const [price, setPrice] = useState(plan.price ? String(plan.price) : '')
  const [months, setMonths] = useState(plan.months ? String(plan.months) : '')
  const ok = name.trim() && Number(price) > 0 && Number(months) > 0

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 lg:items-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[480px] space-y-4 rounded-t-3xl bg-cream p-5 pb-6 lg:rounded-3xl"
      >
        <h2 className="text-lg font-semibold">{plan.id ? 'Edit plan' : 'New plan'}</h2>
        <Field label="Plan name">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Half-yearly" className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (Rs)">
            <input
              value={price}
              inputMode="numeric"
              onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))}
              placeholder="2100"
              className={inputClass}
            />
          </Field>
          <Field label="Duration (months)">
            <input
              value={months}
              inputMode="numeric"
              onChange={(e) => setMonths(e.target.value.replace(/\D/g, ''))}
              placeholder="3"
              className={inputClass}
            />
          </Field>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!ok}
            onClick={() =>
              onSave({
                id: plan.id || `plan-${Date.now()}`,
                name: name.trim(),
                price: Number(price),
                months: Number(months),
              })
            }
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function Plans() {
  const { plans, savePlan, showToast } = useGym()
  const [editing, setEditing] = useState(null)

  return (
    <div>
      <TopBar title="Plans" />
      <div className="space-y-3 px-4">
        {plans.map((p) => (
          <Card key={p.id} className="flex items-center justify-between p-4">
            <div>
              <div className="text-sm text-stone-500">{p.name}</div>
              <div className="text-xl font-semibold">Rs {p.price.toLocaleString('en-IN')}</div>
              <div className="text-xs text-stone-500">{durationLabel(p.months)}</div>
            </div>
            <button onClick={() => setEditing(p)} className="flex h-11 items-center px-3 text-sm font-medium text-brand">
              Edit
            </button>
          </Card>
        ))}
      </div>

      <StickyBar>
        <Button onClick={() => setEditing({ id: '', name: '', price: 0, months: 0 })}>Add new plan</Button>
      </StickyBar>

      {editing && (
        <PlanSheet
          plan={editing}
          onClose={() => setEditing(null)}
          onSave={async (p) => {
            try {
              await savePlan(p)
              setEditing(null)
              showToast('Plan save ho gaya')
            } catch (err) {
              showToast(`Save nahi hua: ${err.code ?? err.message}`)
            }
          }}
        />
      )}
    </div>
  )
}
