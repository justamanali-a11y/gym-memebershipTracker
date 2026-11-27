import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGym } from '../../context/GymContext'
import { Button, Card, Field, StickyBar, TopBar, initials, inputClass } from '../../components/ui'

export default function Profile() {
  const { user, gym, members, plans, updateGym, showToast, logout } = useGym()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: gym.name ?? '',
    owner: gym.owner ?? '',
    city: gym.city ?? '',
    phone: gym.phone ?? '',
    timings: gym.timings ?? '',
  })
  const [saving, setSaving] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const changed = Object.keys(form).some((k) => form[k] !== (gym[k] ?? ''))
  const valid = form.name.trim() && form.owner.trim() && (!form.phone || form.phone.length === 10)

  const save = async () => {
    setSaving(true)
    try {
      await updateGym({ ...form, name: form.name.trim(), owner: form.owner.trim(), city: form.city.trim() })
      showToast('Profile save ho gayi')
    } catch (err) {
      showToast(`Save nahi hua: ${err.code ?? err.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <TopBar title="Profile" />

      <div className="space-y-4 px-4">
        <div className="flex flex-col items-center py-2">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand text-2xl font-semibold text-white">
            {initials(gym.owner || 'G')}
          </div>
          <div className="mt-3 text-lg font-semibold">{gym.owner}</div>
          <div className="text-sm text-stone-500">{user?.email}</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="text-sm text-stone-500">Members</div>
            <div className="mt-1 text-2xl font-semibold">{members.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-stone-500">Plans</div>
            <div className="mt-1 text-2xl font-semibold">{plans.length}</div>
          </Card>
        </div>

        <Card className="space-y-4 p-4">
          <h2 className="font-semibold">Gym details</h2>
          <Field label="Gym ka naam">
            <input value={form.name} onChange={set('name')} placeholder="PowerFit Gym" className={inputClass} />
          </Field>
          <Field label="Owner ka naam">
            <input value={form.owner} onChange={set('owner')} placeholder="Aapka naam" className={inputClass} />
          </Field>
          <Field label="Shehar">
            <input value={form.city} onChange={set('city')} placeholder="Jaipur" className={inputClass} />
          </Field>
          <Field label="Gym ka phone (WhatsApp)">
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
          <Field label="Gym timings">
            <input value={form.timings} onChange={set('timings')} placeholder="6 AM - 10 PM" className={inputClass} />
          </Field>
          <div className="text-sm">
            <span className="text-stone-500">Email: </span>
            <span className="font-medium">{user?.email}</span>
          </div>
        </Card>

        <button
          onClick={async () => {
            await logout()
            navigate('/', { replace: true })
          }}
          className="w-full py-2 text-center text-sm text-stone-500"
        >
          Logout
        </button>
      </div>

      <StickyBar>
        <Button disabled={!changed || !valid || saving} onClick={save}>
          {saving ? 'Saving...' : 'Save changes'}
        </Button>
      </StickyBar>
    </div>
  )
}