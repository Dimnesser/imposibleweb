import { useEffect, useState } from 'react'
import { useSystem } from '../../state/SystemContext.jsx'
import { useLongPress } from '../../hooks/useSequences.js'
import { misword } from '../../hooks/useGlitchEngine.js'
import { countSecrets } from '../../core/secrets.js'

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

function statusFor(secrets, terminatedBefore) {
  if (terminatedBefore) return 'RESUMED'
  if (secrets >= 7) return 'ANOMALOUS'
  if (secrets >= 4) return 'ELEVATED'
  if (secrets >= 2) return 'PARTIAL'
  return 'UNKNOWN'
}

function userFor(visits) {
  if (visits >= 12) return 'RESIDENT'
  if (visits >= 6) return 'KNOWN'
  if (visits >= 3) return 'GUEST*'
  return 'GUEST'
}

export function StatusBar() {
  const { record, sessionId, glitch, actions } = useSystem()
  const now = useClock()
  const secrets = countSecrets(record)

  // Holding the session id is the touch-friendly way to look inside.
  const hold = useLongPress(() => actions.secret('inspect'))

  const status = statusFor(secrets, record.restored > 0)
  const cells = [
    { key: 'SESSION', value: `#${sessionId}`, hold: true },
    { key: 'TIME', value: now.toLocaleTimeString('en-GB', { hour12: false }) },
    { key: 'STATUS', value: status, alert: status === 'ANOMALOUS' },
    { key: 'USER', value: userFor(record.visits) },
  ]

  return (
    <div className="status">
      {cells.map((cell) => (
        <div className="status-cell" key={cell.key} {...(cell.hold ? hold : {})}>
          <span className="status-key">{misword(cell.key, glitch)}</span>
          <span className="status-val" data-alert={String(Boolean(cell.alert))}>
            {misword(cell.value, glitch)}
          </span>
        </div>
      ))}
    </div>
  )
}
