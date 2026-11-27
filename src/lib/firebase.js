
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Check Firebase configuration
const requiredKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'appId',
]

const missingKeys = requiredKeys.filter(
  (key) => !firebaseConfig[key]
)

if (missingKeys.length > 0) {
  throw new Error(
    `Missing Firebase configuration: ${missingKeys.join(', ')}. Check Vercel Environment Variables.`
  )
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

// Firebase Analytics
isSupported()
  .then((supported) => {
    if (supported) getAnalytics(app)
  })
  .catch((error) => {
    console.warn('Firebase Analytics unavailable:', error)
  })
