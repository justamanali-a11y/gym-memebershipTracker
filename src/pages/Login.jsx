import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Dumbbell } from 'lucide-react'
import { useGym } from '../context/GymContext'
import { Button, Card, Field, inputClass } from '../components/ui'

const ERRORS = {
  'auth/email-already-in-use': 'Is email se account pehle se hai. Login karein.',
  'auth/invalid-credential': 'Email ya password galat hai.',
  'auth/wrong-password': 'Password galat hai.',
  'auth/user-not-found': 'Is email ka account nahi mila. Naya account banayein.',
  'auth/weak-password': 'Password kam se kam 6 characters ka rakhein.',
  'auth/invalid-email': 'Email sahi nahi hai.',
  'auth/network-request-failed': 'Internet check karein.',
  'auth/too-many-requests': 'Bahut koshish ho gayi. Thodi der baad try karein.',
  'auth/operation-not-allowed': 'Firebase mein Email/Password enable nahi hai.',
}

export default function Login() {
  const { role, loading, loginOwner, signup } = useGym()
  const [tab, setTab] = useState('owner')
  const [mode, setMode] = useState('login') // login | signup
  const [form, setForm] = useState({ email: '', password: '', gymName: '', ownerName: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [dest, setDest] = useState('/owner')

  if (!loading && role) return <Navigate to={dest} replace />

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const isSignup = mode === 'signup'
  const ok =
    form.email.includes('@') &&
    form.password.length >= 6 &&
    (!isSignup || (form.gymName.trim() && form.ownerName.trim()))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setDest(isSignup ? '/owner/profile' : '/owner')
    try {
      if (isSignup) await signup({ ...form, email: form.email.trim() })
      else await loginOwner(form.email.trim(), form.password)
    } catch (err) {
      setError(ERRORS[err.code] ?? `Kuch gadbad hui (${err.code ?? err.message})`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8">
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white">
            <Dumbbell size={24} />
          </div>
          <span className="text-2xl font-semibold">GymFlow</span>
        </div>
        <p className="text-sm text-stone-500">Gym membership, bina jhanjhat</p>
      </div>

      <Card className="p-5">
        <h2 className="mb-3 text-lg font-semibold">Welcome to GymFlow</h2>

        <div className="mb-5 grid grid-cols-2 rounded-xl bg-stone-200/70 p-1 text-sm font-medium">
          {[
            ['owner', 'Gym Owner'],
            ['member', 'Member'],
          ].map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={`h-10 rounded-lg transition ${tab === k ? 'bg-white shadow-sm' : 'text-stone-500'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'member' ? (
          <p className="rounded-xl bg-brand-soft p-4 text-sm text-brand-dark">
            Member login jaldi aa raha hai. Gym owner aapko invite karega, phir aap apne phone se login kar paoge.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {isSignup && (
              <>
                <Field label="Gym ka naam">
                  <input value={form.gymName} onChange={set('gymName')} placeholder="PowerFit Gym" className={inputClass} />
                </Field>
                <Field label="Aapka naam">
                  <input value={form.ownerName} onChange={set('ownerName')} placeholder="Aman" className={inputClass} />
                </Field>
              </>
            )}
            <Field label="Email">
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={set('email')}
                placeholder="name@example.com"
                className={inputClass}
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                value={form.password}
                onChange={set('password')}
                placeholder="Kam se kam 6 characters"
                className={inputClass}
              />
            </Field>

            {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <Button type="submit" disabled={!ok || busy}>
              {busy ? 'Ruko...' : isSignup ? 'Account banayein' : 'Login'}
            </Button>

            <button
              type="button"
              onClick={() => {
                setMode(isSignup ? 'login' : 'signup')
                setError('')
              }}
              className="w-full text-center text-sm text-stone-600"
            >
              {isSignup ? 'Account hai? Login karein' : 'Naya gym? Account banayein'}
            </button>
          </form>
        )}
      </Card>

      <p className="mt-6 text-center text-xs text-stone-500">By continuing, you agree to GymFlow's terms</p>
    </div>
  )
}
