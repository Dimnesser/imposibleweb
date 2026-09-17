import { useSystem } from '../../state/SystemContext.jsx'
import { useAudio } from '../../hooks/useAudio.jsx'
import { EvasiveButton } from '../common/EvasiveButton.jsx'
import { GlitchText } from '../common/GlitchText.jsx'
import { awayLine } from '../../core/greetings.js'

export function Gate() {
  const { actions, record, away, sessionId } = useSystem()
  const audio = useAudio()
  const returning = record.visits > 1

  return (
    <div className="frame" data-size="narrow">
      <span className="frame-tag">unlisted node</span>
      <div className="gate">
        <span className="gate-meta">
          {returning ? `session ${sessionId} · previously seen` : `node ${sessionId}`}
        </span>

        <GlitchText as="h1" className="gate-title" text="YOU SHOULDN’T BE HERE." />

        <p className="gate-sub">
          {returning ? 'Nothing is wrong. Still.' : 'Nothing is wrong. Probably.'}
        </p>

        <EvasiveButton
          onClick={() => {
            audio.blip('open')
            actions.press('ENTER')
            actions.enter()
          }}
        >
          Enter
        </EvasiveButton>

        {returning && away != null && <span className="gate-meta">{awayLine(away)}</span>}
      </div>
    </div>
  )
}
