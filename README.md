# GymFlow

Gym aur yoga studios ke liye membership management (mobile-first PWA).
React + Vite + Tailwind CSS v4 + React Router. Backend: Firebase (Auth: Email/Password, Database: Firestore).

## Chalane ka tareeka

```bash
npm install
npm run dev
```

Browser mein http://localhost:5173 kholo (phone-size mein dekhne ke liye DevTools > mobile view).

Pehli baar: Login screen pe "Naya gym? Account banayein" dabao, gym ka naam, email aur password (6+ characters) daalo.
Pehle `.env` mein Firebase keys honi chahiye (`.env.example` dekho). Member login abhi baaki hai.

## Screens

- Owner: Dashboard, Members, Add Member (3 steps), Member profile, Renew, Plans, Reminders, Reports, More
- Member: Home (check in), Attendance, Renew, Profile

## Folder structure

```
src/
  components/   ui.jsx (Card, StatusPill, PlanCard, QR...), BottomNav.jsx
  context/      GymContext.jsx (saara state + actions: addMember, renewMember...)
  data/         members.js (dummy data), plans.js
  layouts/      Frame.jsx (phone frame + toast), RoleLayout.jsx (login guard + nav)
  lib/          dates.js (expiry logic), whatsapp.js (wa.me link), image.js
  pages/        Login.jsx, owner/, member/
```

## Business rules (src/lib/dates.js)

- 7 din ya kam bacha = orange (expiring), usse zyada = green, negative = red (expired)
- Renew: active member ho to purani end date se aage badhta hai, expired ho to aaj se

## Firebase

- Data structure: `gyms/{ownerUid}` (gym ka naam, plans, reminders) aur `gyms/{ownerUid}/members/{id}`
- Security rules: `firestore.rules` file ka content Firebase console > Firestore > Rules mein paste karke Publish karo
- Saara backend code `src/context/GymContext.jsx` mein hai

## Aage ka kaam

1. Member login (owner invite kare)
2. Reports ko payments data se calculate karo (abhi dummy)
3. Deploy: Vercel (Environment Variables mein 4 VITE_ keys daalna, phir Firebase Auth > Settings > Authorized domains mein Vercel domain jodna)

## Deploy (Vercel)

```bash
npm run build
```

Repo GitHub pe push karo, Vercel mein import karo. Build command `npm run build`, output `dist`.
