import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

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
  reminders: {
    d7: true,
    d3: true,
    d0: false,
    message: DEFAULT_TEMPLATE,
  },
  createdAt: serverTimestamp(),
})

export function GymProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)

  const [gym, setGym] = useState(null)
  const [members, setMembers] = useState([])
  const [membersReady, setMembersReady] = useState(false)

  const [toast, setToast] = useState('')
  const [demoMode, setDemoMode] = useState(false)

  // Demo data
  const [demoGym, setDemoGym] = useState(() => ({
    name: 'PowerFit Gym',
    owner: 'Demo Owner',
    city: 'Jaipur',
    timings: '6 AM - 10 PM',
    phone: '',
    plans: defaultPlans,
    reminders: {
      d7: true,
      d3: true,
      d0: false,
      message: DEFAULT_TEMPLATE,
    },
  }))

  const [demoMembers, setDemoMembers] = useState([])

  const timer = useRef()
  const signingUp = useRef(false)

  const showToast = useCallback((msg) => {
    setToast(msg)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(''), 2600)
  }, [])

  // 1. Firebase login state
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthReady(true)
    })
  }, [])

  // 2. Gym document + members (live)
  useEffect(() => {
    // Demo mode mein Firestore listeners ki zaroorat nahi
    if (demoMode) return

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
        if (snap.exists()) {
          setGym(snap.data())
        } else if (!signingUp.current) {
          setDoc(
            gymRef,
            newGymDoc('My Gym', user.email?.split('@')[0]),
          )
        }
      },
      (err) => showToast(`Gym load nahi hua: ${err.code}`),
    )

    const offMembers = onSnapshot(
      collection(db, 'gyms', user.uid, 'members'),
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))

        list.sort(
          (a, b) =>
            (b.createdAt?.toMillis?.() ?? Date.now()) -
            (a.createdAt?.toMillis?.() ?? Date.now()),
        )

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
  }, [user, demoMode, showToast])

  const loading = demoMode
    ? false
    : !authReady || (!!user && (!gym || !membersReady))

  // Active data: Demo or Firebase
  const activeGym = demoMode ? demoGym : gym

  const activeMembers = demoMode ? demoMembers : members

  const plans = activeGym?.plans ?? defaultPlans

  const reminders = activeGym?.reminders ?? {
    d7: true,
    d3: true,
    d0: false,
    message: DEFAULT_TEMPLATE,
  }

  const planOf = useCallback(
    (id) => plans.find((p) => p.id === id),
    [plans],
  )

  const gymRef = () => doc(db, 'gyms', user.uid)

  const memberRef = (id) =>
    doc(db, 'gyms', user.uid, 'members', id)

  // ---- Auth ----

  const signup = async ({
    email,
    password,
    gymName,
    ownerName,
  }) => {
    signingUp.current = true

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      )

      await setDoc(
        doc(db, 'gyms', cred.user.uid),
        newGymDoc(gymName, ownerName),
      )
    } finally {
      signingUp.current = false
    }
  }

  const loginOwner = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  // Demo login
  const loginDemo = () => {
    const demoData = sampleMembers(defaultPlans).map((m, index) => ({
      ...m,
      id: `demo-${index + 1}`,
    }))

    setDemoGym({
      name: 'PowerFit Gym',
      owner: 'Demo Owner',
      city: 'Jaipur',
      timings: '6 AM - 10 PM',
      phone: '',
      plans: defaultPlans,
      reminders: {
        d7: true,
        d3: true,
        d0: false,
        message: DEFAULT_TEMPLATE,
      },
    })

    setDemoMembers(demoData)
    setDemoMode(true)

    showToast('Demo mode started!')
  }

  const logout = async () => {
    if (demoMode) {
      setDemoMode(false)
      setDemoMembers([])
      setDemoGym({
        name: 'PowerFit Gym',
        owner: 'Demo Owner',
        city: 'Jaipur',
        timings: '6 AM - 10 PM',
        phone: '',
        plans: defaultPlans,
        reminders: {
          d7: true,
          d3: true,
          d0: false,
          message: DEFAULT_TEMPLATE,
        },
      })
      return
    }

    await signOut(auth)
  }

  // ---- Members ----

  const addMember = async ({
    name,
    phone,
    email,
    photo,
    planId,
    startDate,
    mode,
  }) => {
    const plan = planOf(planId)
    const endDate = addMonths(startDate, plan.months)

    if (demoMode) {
      const newMember = {
        id: `demo-${Date.now()}`,
        name: name.trim(),
        phone,
        email: email || '',
        photo: photo || null,
        planId,
        startDate,
        endDate,
        payments: [
          {
            date: todayISO(),
            amount: plan.price,
            mode,
          },
        ],
        attendance: [],
        createdAt: new Date(),
      }

      setDemoMembers((prev) => [newMember, ...prev])

      return {
        name: name.trim(),
        endDate,
      }
    }

    await addDoc(
      collection(db, 'gyms', user.uid, 'members'),
      {
        name: name.trim(),
        phone,
        email: email || '',
        photo: photo || null,
        planId,
        startDate,
        endDate,
        payments: [
          {
            date: todayISO(),
            amount: plan.price,
            mode,
          },
        ],
        attendance: [],
        createdAt: serverTimestamp(),
      },
    )

    return {
      name: name.trim(),
      endDate,
    }
  }

  // Active ho to purani end date se aage, expired ho to aaj se
  const renewMember = async (id, planId, mode) => {
    const m = activeMembers.find((x) => x.id === id)
    const plan = planOf(planId)

    const start =
      daysLeft(m.endDate) >= 0
        ? m.endDate
        : todayISO()

    const endDate = addMonths(start, plan.months)

    if (demoMode) {
      setDemoMembers((prev) =>
        prev.map((member) =>
          member.id === id
            ? {
                ...member,
                planId,
                startDate: start,
                endDate,
                payments: [
                  ...(member.payments || []),
                  {
                    date: todayISO(),
                    amount: plan.price,
                    mode,
                  },
                ],
              }
            : member,
        ),
      )

      return {
        name: m.name,
        startDate: start,
        endDate,
      }
    }

    await updateDoc(memberRef(id), {
      planId,
      startDate: start,
      endDate,
      payments: arrayUnion({
        date: todayISO(),
        amount: plan.price,
        mode,
      }),
    })

    return {
      name: m.name,
      startDate: start,
      endDate,
    }
  }

  const checkIn = (id) => {
    if (demoMode) {
      setDemoMembers((prev) =>
        prev.map((member) =>
          member.id === id
            ? {
                ...member,
                attendance: [
                  ...new Set([
                    ...(member.attendance || []),
                    todayISO(),
                  ]),
                ],
              }
            : member,
        ),
      )

      return
    }

    return updateDoc(memberRef(id), {
      attendance: arrayUnion(todayISO()),
    })
  }

  // ---- Gym settings ----

  const savePlan = async (plan) => {
    const exists = plans.some((p) => p.id === plan.id)

    const next = exists
      ? plans.map((p) => (p.id === plan.id ? plan : p))
      : [...plans, plan]

    if (demoMode) {
      setDemoGym((prev) => ({
        ...prev,
        plans: next,
      }))
      return
    }

    await updateDoc(gymRef(), {
      plans: next,
    })
  }

  const setReminders = (r) => {
    if (demoMode) {
      setDemoGym((prev) => ({
        ...prev,
        reminders: r,
      }))
      return
    }

    return updateDoc(gymRef(), {
      reminders: r,
    })
  }

  // Testing ke liye: 10 sample members ek saath
  const seedDemo = async () => {
    if (demoMode) {
      const data = sampleMembers(plans).map((m, index) => ({
        ...m,
        id: `demo-${index + 1}`,
      }))

      setDemoMembers(data)
      showToast('Demo members added!')
      return
    }

    const batch = writeBatch(db)

    sampleMembers(plans).forEach((m) => {
      batch.set(
        doc(collection(db, 'gyms', user.uid, 'members')),
        {
          ...m,
          createdAt: serverTimestamp(),
        },
      )
    })

    await batch.commit()
  }

  const value = useMemo(
    () => ({
      user,
      role: demoMode || user ? 'owner' : null,
      loading,

      gym: activeGym ?? {
        name: '',
        owner: '',
        city: '',
        timings: '',
        phone: '',
      },

      plans,
      reminders,
      members: activeMembers,
      meId: activeMembers[0]?.id,

      toast,
      showToast,
      planOf,

      signup,
      loginOwner,
      loginDemo,
      logout,

      addMember,
      renewMember,
      checkIn,

      savePlan,
      setReminders,
      seedDemo,
    }),
    [
      user,
      demoMode,
      loading,
      activeGym,
      plans,
      reminders,
      activeMembers,
      toast,
      showToast,
      planOf,
    ],
  )

  return (
    <Ctx.Provider value={value}>
      {children}
    </Ctx.Provider>
  )
}