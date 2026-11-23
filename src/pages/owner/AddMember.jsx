import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera } from 'lucide-react'
import { useGym } from '../../context/GymContext'
import {
  Button,
  Card,
  Field,
  PayPanel,
  PayToggle,
  PlanCard,
  StickyBar,
  SuccessScreen,
  TopBar,
  inputClass,
} from '../../components/ui'
import { addMonths, fmt, todayISO } from '../../lib/dates'
import { resizeImage } from '../../lib/image'

const STEPS = ['Details', 'Plan', 'Payment']

export default function AddMember() {
  const { plans, planOf, addMember, showToast } = useGym()
  const navigate = useNavigate()
  const fileRef = useRef()

  const [step, setStep] = useState(0)
  const [done, setDone] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '', photo: null })
  const [planId, setPlanId] = useState(plans[1]?.id ?? plans[0].id)
  const [mode, setMode] = useState('UPI')
  const [received, setReceived] = useState(false)
  const startDate = todayISO()

  const plan = planOf(planId)
  const endDate = addMonths(startDate, plan.months)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const detailsOk = form.name.trim().length > 1 && form.phone.length === 10
  const payOk = mode === 'UPI' || received

  const pickPhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const photo = await resizeImage(file)
    setForm((f) => ({ ...f, photo }))
  }

  const [saving, setSaving] = useState(false)
  const confirm = async () => {
    setSaving(true)
    try {
      const m = await addMember({ ...form, planId, startDate, mode })
      setDone(m)
      showToast('Member add ho gaya')
    } catch (err) {
      showToast(`Save nahi hua: ${err.code ?? err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const back = () => (step === 0 ? navigate(-1) : setStep(step - 1))

  if (done) {
    return (
      <SuccessScreen
        title="Member added!"
        line={`${done.name} · ${plan.name} · Ends ${fmt(done.endDate)}`}
        buttonLabel="Back to members"
        onDone={() => navigate('/owner/members', { replace: true })}
      />
    )
  }

  return (
    <div>
      <TopBar title="Add member" />

      <div className="px-4">
        <div className="mb-1 grid grid-cols-3 text-sm">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={`${i === 0 ? 'text-left' : i === 2 ? 'text-right' : 'text-center'} ${
                i === step ? 'font-medium text-brand' : 'text-stone-500'
              }`}
            >
              {s}
            </span>
          ))}
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${((step + 1) / 3) * 100}%` }} />
        </div>
        <p className="mb-4 mt-1.5 text-xs text-stone-500">Step {step + 1} of 3</p>

        {step === 0 && (
          <>
            <div className="mb-4 flex flex-col items-center">
              <button
                onClick={() => fileRef.current.click()}
                className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-dashed border-stone-400 bg-white text-stone-600"
              >
                {form.photo ? <img src={form.photo} alt="" className="h-full w-full object-cover" /> : <Camera size={22} />}
              </button>
              <span className="mt-1.5 text-xs text-stone-500">Add photo · optional</span>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto} />
            </div>

            <Card className="space-y-4 p-4">
              <div>
                <h2 className="font-semibold">Member details</h2>
                <p className="text-sm text-stone-500">Thoda sa info, phir membership ready.</p>
              </div>
              <Field label="Full name">
                <input value={form.name} onChange={set('name')} placeholder="Enter full name" className={inputClass} />
              </Field>
              <Field label="Mobile number">
                <div className="flex items-center rounded-xl border border-stone-300 bg-white focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
                  <span className="pl-3 text-[15px] text-stone-500">+91</span>
                  <input
                    value={form.phone}
                    inputMode="numeric"
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="10-digit mobile number"
                    className="h-12 flex-1 bg-transparent px-2 text-[15px] outline-none placeholder:text-stone-400"
                  />
                </div>
              </Field>
              <Field label="Email (optional)">
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="name@example.com"
                  className={inputClass}
                />
              </Field>
            </Card>
          </>
        )}

        {step === 1 && (
          <div className="space-y-3">
            {plans.map((p) => (
              <PlanCard key={p.id} plan={p} selected={p.id === planId} onSelect={setPlanId} />
            ))}
            <p className="px-1 pt-1 text-sm text-stone-500">
              {fmt(startDate)} se {fmt(endDate)} tak
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Card className="space-y-2.5 p-4 text-sm">
              {[
                ['Member', form.name],
                ['Plan', plan.name],
                ['Starts', fmt(startDate)],
                ['Ends', fmt(endDate)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-stone-500">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-stone-100 pt-2.5">
                <span className="text-stone-500">Amount</span>
                <span className="font-semibold">Rs {plan.price.toLocaleString('en-IN')}</span>
              </div>
            </Card>
            <PayToggle value={mode} onChange={setMode} />
            <PayPanel mode={mode} amount={plan.price} received={received} setReceived={setReceived} seed={form.name + planId} />
          </div>
        )}
      </div>

      <StickyBar>
        {step > 0 && (
          <Button variant="outline" onClick={back} className="!w-28">
            Back
          </Button>
        )}
        {step === 0 && (
          <Button disabled={!detailsOk} onClick={() => setStep(1)}>
            Continue to plan
          </Button>
        )}
        {step === 1 && <Button onClick={() => setStep(2)}>Continue to payment</Button>}
        {step === 2 && (
          <Button disabled={!payOk || saving} onClick={confirm}>
            {saving ? 'Saving...' : 'Confirm and add member'}
          </Button>
        )}
      </StickyBar>
    </div>
  )
}
