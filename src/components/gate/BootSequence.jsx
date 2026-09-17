import { useEffect, useMemo, useRef, useState } from 'react'
import { useSystem } from '../../state/SystemContext.jsx'
import { useAudio } from '../../hooks/useAudio.jsx'
import { formatDuration } from '../../core/greetings.js'

/** The interface deliberately does nothing at all for this long first. */
const HANG_MS = 1700

function buildScript(record, sessionId) {
  const base = [
    { text: 'SYSTEM INITIALIZING...', wait: 900 },
    { text: 'USER DETECTED', wait: 700 },
    { text: 'SESSION CREATED', wait: 650 },
  ]

  // Returning users get extra lines that reference their own history.
  if (record.visits > 1) {
    base.splice(2, 0, {
      text: `PRIOR SESSIONS: ${String(record.visits - 1).padStart(3, '0')}`,
      wait: 520,
    })
  }
  if (record.totalTime > 60_000) {
    base.splice(3, 0, { text: `TIME ON RECORD: ${formatDuration(record.totalTime)}`, wait: 520 })
  }
  if (record.restored > 0) {
    base.splice(1, 0, { text: 'SESSION RESTORED', wait: 640 })
  }
  if (Object.keys(record.secrets).length >= 3) {
    base.push({ text: 'ANOMALIES ATTACHED TO THIS USER', wait: 600 })
  }

  base.push({ text: `HANDLE ${sessionId}`, wait: 480 })
  base.push({ text: 'DON’T LOOK FOR THE EXIT', wait: 1500 })
  return base
}

export function BootSequence() {
  const { actions, record, sessionId } = useSystem()
  const audio = useAudio()
  const script = useMemo(() => buildScript(record, sessionId), [])
  const [index, setIndex] = useState(-1)
  const finished = useRef(false)

  useEffect(() => {
    let cancelled = false
    const timers = []

    const step = (i) => {
      if (cancelled) return
      if (i >= script.length) {
        if (finished.current) return
        finished.current = true
        timers.push(setTimeout(() => !cancelled && actions.booted(), 700))
        return
      }
      setIndex(i)
      audio.blip(i === script.length - 1 ? 'deny' : 'ui')
      timers.push(setTimeout(() => step(i + 1), script[i].wait))
    }

    timers.push(setTimeout(() => step(0), HANG_MS))
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [script, actions, audio])

  const progress = index < 0 ? 0 : Math.round(((index + 1) / script.length) * 100)

  return (
    <div className="frame" data-size="narrow">
      <span className="frame-tag">handshake</span>
      <div className="boot" aria-live="polite">
        {index < 0 ? (
          <span className="boot-line caret" />
        ) : (
          script.slice(0, index + 1).map((line, i) => (
            <span className="boot-line" key={line.text}>
              <span className="mark">&gt;</span>
              <span className={i === index ? 'caret' : undefined}>{line.text}</span>
            </span>
          ))
        )}
        <div className="progress" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}
