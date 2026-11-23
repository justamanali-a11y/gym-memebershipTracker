import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { defaultPlans } from '../data/plans'
import { sampleMembers } from '../data/members'
import { addMonths, daysLeft, todayISO } from '../lib/dates'
import { DEFAULT_TEMPLATE } from '../lib/whatsapp'

const Ctx = createContext(null)
export const useGym = () => useContext(Ctx)

const newGymDoc = (name, owner) => ({
  name: name || 'My Gym',
  owner: owner || 'Owner',
  city: '',
  timings: '6 AM - 10 PM',
  phone: '',
  plans: defaultPlans,
  reminders: { d7: true, d3: true, d0: false, message: DEFAULT_TEMPLATE },
  createdAt: serverTimestamp(),
})

export function GymProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [gym, setGym] = useState(null)
  const [members, setMembers] = useState([])
  const [membersReady, setMembersReady] = useState(false)
  const [toast, setToast] = useState('')
  const timer = useRef()
  const signingUp = useRef(false)

  // 1. Login state
  useEffect(() => onAuthStateChanged(auth, (u) => {
    setUser(u)
    setAuthReady(true)
  }), [])

  // 2. Gym document + members (live)
  useEffect(() => {
    if (!user) {
      setGym(null)
      setMembers([])
      setMembersReady(false)
      return
    }
    const gymRef = doc(db, 'gyms', user.uid)
    const offGym = onSnapshot(
      gymRef,
      (snap) => {
        if (snap.exists()) setGym(snap.data())
        else if (!signingUp.current) setDoc(gymRef, newGymDoc('My Gym', user.email?.split('@')[0]))
      },
      (err) => showToast(`Gym load nahi hua: ${err.code}`),
    )
    const offMembers = onSnapshot(
      collection(db, 'gyms', user.uid, 'members'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        list.sort((a, b) => (b.createdAt?.toMillis?.() ?? Date.now()) - (a.createdAt?.toMillis?.() ?? Date.now()))
        setMembers(list)
        setMembersReady(true)
      },
      (err) => {
        setMembersReady(true)
        showToast(`Members load nahi hue: ${err.code}`)
      },
    )
    return () => {
      offGym()
      offMembers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const showToast = useCallback((msg) => {
    setToast(msg)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(''), 2600)
  }, [])

  const loading = !authReady || (!!user && (!gym || !membersReady))
  const plans = gym?.plans ?? defaultPlans
  const reminders = gym?.reminders ?? { d7: true, d3: true, d0: false, message: DEFAULT_TEMPLATE }
  const planOf = useCallback((id) => plans.find((p) => p.id === id), [plans])
  const gymRef = () => doc(db, 'gyms', user.uid)
  const memberRef = (id) => doc(db, 'gyms', user.uid, 'members', id)

  // ---- Auth ----
  const signup = async ({ email, password, gymName, ownerName }) => {
    signingUp.current = true
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await setDoc(doc(db, 'gyms', cred.user.uid), newGymDoc(gymName, ownerName))
    } finally {
      signingUp.current = false
    }
  }
  const loginOwner = (email, password) => signInWithEmailAndPassword(auth, email, password)
  const logout = () => signOut(auth)

  // ---- Members ----
  const addMember = async ({ name, phone, email, photo, planId, startDate, mode }) => {
    const plan = planOf(planId)
    const endDate = addMonths(startDate, plan.months)
    await addDoc(collection(db, 'gyms', user.uid, 'members'), {
      name: name.trim(),
      phone,
      email: email || '',
      photo: photo || null,
      planId,
      startDate,
      endDate,
      payments: [{ date: todayISO(), amount: plan.price, mode }],
      attendance: [],
      createdAt: serverTimestamp(),
    })
    return { name: name.trim(), endDate }
  }

  // Active ho to purani end date se aage, expired ho to aaj se
  const renewMember = async (id, planId, mode) => {
    const m = members.find((x) => x.id === id)
    const plan = planOf(planId)
    const start = daysLeft(m.endDate) >= 0 ? m.endDate : todayISO()
    const endDate = addMonths(start, plan.months)
    await updateDoc(memberRef(id), {
      planId,
      startDate: start,
      endDate,
      payments: arrayUnion({ date: todayISO(), amount: plan.price, mode }),
    })
    return { name: m.name, startDate: start, endDate }
  }

  const checkIn = (id) => updateDoc(memberRef(id), { attendance: arrayUnion(todayISO()) })

  // ---- Gym settings ----
  const savePlan = async (plan) => {
    const exists = plans.some((p) => p.id === plan.id)
    const next = exists ? plans.map((p) => (p.id === plan.id ? plan : p)) : [...plans, plan]
    await updateDoc(gymRef(), { plans: next })
  }
  const setReminders = (r) => updateDoc(gymRef(), { reminders: r })
  const updateGym = (fields) => updateDoc(gymRef(), fields)

  // Testing ke liye: 10 sample members ek saath
  const seedDemo = async () => {
    const batch = writeBatch(db)
    sampleMembers(plans).forEach((m) => {
      batch.set(doc(collection(db, 'gyms', user.uid, 'members')), { ...m, createdAt: serverTimestamp() })
    })
    await batch.commit()
  }

  const value = useMemo(
    () => ({
      user,
      role: user ? 'owner' : null,
      loading,
      gym: gym ?? { name: '', owner: '', city: '', timings: '', phone: '' },
      plans,
      reminders,
      members,
      meId: members[0]?.id,
      toast,
      showToast,
      planOf,
      signup,
      loginOwner,
      logout,
      addMember,
      renewMember,
      checkIn,
      savePlan,
      setReminders,
      updateGym,
      seedDemo,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading, gym, members, toast],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
