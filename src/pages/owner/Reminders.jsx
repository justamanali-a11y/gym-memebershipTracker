import { useState } from 'react'
import { useGym } from '../../context/GymContext'
import { Button, Card, StickyBar, Toggle, TopBar } from '../../components/ui'

const ROWS = [
  ['d7', '7 days before expiry'],
  ['d3', '3 days before expiry'],
  ['d0', 'On expiry day'],
]

export default function Reminders() {
  const { reminders, setReminders, showToast } = useGym()
  const [draft, setDraft] = useState(reminders)

  return (
    <div>
      <TopBar title="Reminders" />
      <div className="space-y-4 px-4">
        <Card>
          {ROWS.map(([k, label], i) => (
            <div key={k} className={`flex items-center justify-between p-4 ${i > 0 ? 'border-t border-stone-100' : ''}`}>
              <span className="font-medium">{label}</span>
              <Toggle on={draft[k]} onChange={(v) => setDraft({ ...draft, [k]: v })} />
            </div>
          ))}
        </Card>

        <Card className="p-4">
          <h2 className="mb-2 font-semibold">Message</h2>
          <textarea
            value={draft.message}
            onChange={(e) => setDraft({ ...draft, message: e.target.value })}
            rows={4}
            className="w-full rounded-xl border border-stone-300 bg-white p-3 text-[15px] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <p className="mt-2 text-xs text-stone-500">
            <code>{'{name}'}</code> aur <code>{'{date}'}</code> member ke naam aur expiry date se replace ho jayenge.
          </p>
        </Card>
      </div>

      <StickyBar>
        <Button
          onClick={async () => {
            try {
              await setReminders(draft)
              showToast('Reminders save ho gaye')
            } catch (err) {
              showToast(`Save nahi hua: ${err.code ?? err.message}`)
            }
          }}
        >
          Save
        </Button>
      </StickyBar>
    </div>
  )
}
