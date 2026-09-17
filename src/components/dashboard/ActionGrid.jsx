import { useCallback, useEffect, useRef, useState } from 'react'
import { useSystem, SCREENS } from '../../state/SystemContext.jsx'
import { useAudio } from '../../hooks/useAudio.jsx'
import { misword } from '../../hooks/useGlitchEngine.js'
import { chance, pick } from '../../core/random.js'
import { roomUnlocked } from '../../core/secrets.js'
import { CONTINUE_RESPONSES, EXIT_RESPONSES, exitLabel, exitStage } from '../../core/exit.js'

const DRIFT_EVERY = 18_000

export function ActionGrid({ onResponse, onCollapse, onOffer }) {
  const { record, actions, glitch } = useSystem()
  const audio = useAudio()
  const [drifted, setDrifted] = useState(null)
  const [exitNudge, setExitNudge] = useState({ x: 0, y: 0 })
  const continueIndex = useRef(0)

  // Now and then one button is a few pixels off where it should be.
  useEffect(() => {
    const id = setInterval(() => {
      setDrifted(chance(0.45) ? pick(['CONTINUE', 'SETTINGS', 'ARCHIVE', 'EXIT']) : null)
    }, DRIFT_EVERY)
    return () => clearInterval(id)
  }, [])

  const driftStyle = (id) =>
    drifted === id ? { transform: 'translate3d(4px, -3px, 0)' } : undefined

  const handleContinue = useCallback(() => {
    actions.press('CONTINUE')
    if (roomUnlocked(record)) {
      audio.blip('open')
      actions.openRoom()
      return
    }
    audio.blip('deny')
    const i = continueIndex.current
    continueIndex.current = Math.min(i + 1, CONTINUE_RESPONSES.length - 1)
    onResponse(CONTINUE_RESPONSES[i])
  }, [actions, audio, record, onResponse])

  const handleSettings = useCallback(() => {
    actions.press('SETTINGS')
    audio.blip('ui')
    // Sometimes the settings are not the settings.
    const opens = record.clicks.SETTINGS || 0
    const wrong = opens >= 2 && chance(0.35)
    actions.navigate(wrong ? SCREENS.DEEP : SCREENS.SETTINGS)
  }, [actions, audio, record.clicks.SETTINGS])

  const handleArchive = useCallback(() => {
    actions.press('ARCHIVE')
    audio.blip('ui')
    actions.navigate(SCREENS.ARCHIVE)
  }, [actions, audio])

  const handleExit = useCallback(() => {
    const next = record.exitPresses + 1
    const stage = exitStage(next)
    actions.press('EXIT')
    actions.exitPress()

    if (next >= 6) actions.secret('persistence')

    if (stage === 'moved') {
      // It leaves before you finish pressing it.
      setExitNudge({ x: chance(0.5) ? -90 : 90, y: chance(0.5) ? -34 : 34 })
      setTimeout(() => setExitNudge({ x: 0, y: 0 }), 1400)
    }

    audio.blip(stage === 'close' ? 'open' : 'deny')
    onResponse(EXIT_RESPONSES[stage])

    if (stage === 'close') onCollapse()
    if (stage === 'offer') onOffer()
  }, [record.exitPresses, actions, audio, onResponse, onCollapse, onOffer])

  const unlocked = roomUnlocked(record)

  return (
    <div className="actions">
      <button
        type="button"
        className="btn"
        style={driftStyle('CONTINUE')}
        onClick={handleContinue}
      >
        {unlocked ? 'ROOM 07' : misword('CONTINUE', glitch)}
      </button>

      <button
        type="button"
        className="btn"
        style={driftStyle('SETTINGS')}
        onClick={handleSettings}
      >
        {misword('SETTINGS', glitch)}
      </button>

      <button
        type="button"
        className="btn"
        style={driftStyle('ARCHIVE')}
        onClick={handleArchive}
      >
        {misword('ARCHIVE', glitch)}
      </button>

      <button
        type="button"
        className="btn"
        data-variant={record.exitPresses >= 3 ? 'danger' : undefined}
        style={{
          transform: `translate3d(${exitNudge.x}px, ${exitNudge.y}px, 0)`,
          ...(drifted === 'EXIT' ? { transform: 'translate3d(4px, -3px, 0)' } : null),
        }}
        onClick={handleExit}
      >
        {exitLabel(record.exitPresses)}
      </button>
    </div>
  )
}
