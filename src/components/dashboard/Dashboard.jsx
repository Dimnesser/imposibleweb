import { useCallback, useEffect, useRef, useState } from 'react'
import { useSystem } from '../../state/SystemContext.jsx'
import { useAudio } from '../../hooks/useAudio.jsx'
import { StatusBar } from './StatusBar.jsx'
import { ActionGrid } from './ActionGrid.jsx'
import { GlitchText } from '../common/GlitchText.jsx'
import { greetingFor } from '../../core/greetings.js'
import { countSecrets } from '../../core/secrets.js'
import { foundEndings } from '../../core/endings.js'

const COLLAPSE_MS = 2600

/** The screen shown while the interface is "closed". */
function Collapsed({ onDone }) {
  // The session clock re-renders this every second; the timer must not restart.
  const done = useRef(onDone)
  done.current = onDone
  useEffect(() => {
    const id = setTimeout(() => done.current(), COLLAPSE_MS)
    return () => clearTimeout(id)
  }, [])
  return (
    <div className="frame" data-size="narrow">
      <span className="frame-tag">closed</span>
      <div className="gate">
        <span className="terminated">interface closed</span>
        <span className="gate-meta">the session is still open</span>
      </div>
    </div>
  )
}

export function Dashboard() {
  const { record, actions, glitch } = useSystem()
  const audio = useAudio()
  const [response, setResponse] = useState(null)
  const [collapsed, setCollapsed] = useState(false)
  const [offering, setOffering] = useState(false)

  const greeting = greetingFor(record.visits)
  const secrets = countSecrets(record)
  const endings = foundEndings(record).length

  const respond = useCallback((text) => {
    setResponse(text)
  }, [])

  useEffect(() => {
    if (!response) return undefined
    const id = setTimeout(() => setResponse(null), 6000)
    return () => clearTimeout(id)
  }, [response])

  if (collapsed) return <Collapsed onDone={() => setCollapsed(false)} />

  return (
    <div className="frame" data-size="mid">
      <span className="frame-tag">session active</span>

      <StatusBar />

      <div className="greeting">
        <GlitchText as="h2" text={greeting.line} />
        <p className={glitch?.kind === 'vanish' ? 'glitch-target' : undefined}>
          {response ?? greeting.sub}
        </p>
      </div>

      <ActionGrid
        onResponse={respond}
        onCollapse={() => setCollapsed(true)}
        onOffer={() => setOffering(true)}
      />

      {offering && (
        <div className="actions" style={{ marginTop: 12 }}>
          <button
            type="button"
            className="btn"
            data-variant="danger"
            onClick={() => {
              audio.blip('deny')
              actions.reachEnding('RETURNED')
            }}
          >
            Terminate session
          </button>
          <button
            type="button"
            className="btn"
            data-variant="ghost"
            onClick={() => {
              audio.blip('ui')
              setOffering(false)
              respond('Good. There was nothing out there anyway.')
            }}
          >
            Stay
          </button>
        </div>
      )}

      <div className="dash-foot">
        <div className="foot-group">
          {secrets > 0 && (
            <span className="counter">
              anomalies <b>{String(secrets).padStart(2, '0')}</b>
            </span>
          )}
          {endings > 0 && (
            <span className="counter">
              endings <b>{String(endings).padStart(2, '0')}</b>
            </span>
          )}
          {secrets === 0 && <span className="counter">nothing logged</span>}
        </div>

        <div className="foot-group">
          <button
            type="button"
            className="btn"
            data-variant="ghost"
            onClick={() => {
              const on = !record.sound
              actions.setSound(on)
              if (on) setTimeout(() => audio.blip('open'), 260)
            }}
            aria-pressed={record.sound}
          >
            sound {record.sound ? 'on' : 'off'}
          </button>

          {/* It has been in this corner since the first visit. */}
          <button
            type="button"
            className="dot"
            data-found={String(Boolean(record.secrets.dot))}
            aria-label="."
            onClick={() => {
              audio.blip('secret')
              actions.secret('dot')
            }}
          />
        </div>
      </div>
    </div>
  )
}
