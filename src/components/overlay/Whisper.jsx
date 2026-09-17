import { useSystem } from '../../state/SystemContext.jsx'

/** The quiet line in the corner. Never blocks anything, never demands a reply. */
export function Whisper() {
  const { whisper } = useSystem()
  if (!whisper) return null
  return (
    <div className="whisper" key={whisper.id} role="status" aria-live="polite">
      <span>{whisper.text}</span>
    </div>
  )
}
