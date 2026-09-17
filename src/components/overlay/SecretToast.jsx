import { useEffect } from 'react'
import { useSystem } from '../../state/SystemContext.jsx'
import { useAudio } from '../../hooks/useAudio.jsx'
import { Scrambler } from '../common/Scrambler.jsx'

const HOLD_MS = 3400

/** The reaction shown when something is found. Dismisses itself, or on a tap. */
export function SecretToast() {
  const { toast, actions } = useSystem()
  const audio = useAudio()

  useEffect(() => {
    if (!toast) return undefined
    audio.blip('secret')
    const id = setTimeout(() => actions.clearToast(toast.id), HOLD_MS)
    return () => clearTimeout(id)
  }, [toast, actions, audio])

  if (!toast) return null

  return (
    <div
      className="toast"
      role="status"
      aria-live="polite"
      onClick={() => actions.clearToast(toast.id)}
    >
      <div className="toast-inner">
        <Scrambler as="h3" text={toast.title} speed={22} />
        {toast.sub && <p>{toast.sub}</p>}
      </div>
    </div>
  )
}
