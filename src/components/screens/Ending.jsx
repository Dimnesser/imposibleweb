import { useEffect, useState } from 'react'
import { useSystem } from '../../state/SystemContext.jsx'
import { useAudio } from '../../hooks/useAudio.jsx'
import { Scrambler } from '../common/Scrambler.jsx'
import { ENDINGS, foundEndings } from '../../core/endings.js'

const READ_MS = 8000
const OFFER_MS = 12000

export function Ending() {
  const { endingId, record } = useSystem()
  const audio = useAudio()
  const [terminated, setTerminated] = useState(false)
  const [offer, setOffer] = useState(false)
  const ending = ENDINGS[endingId] ?? ENDINGS.UNKNOWN

  useEffect(() => {
    audio.burst(600)
    const a = setTimeout(() => setTerminated(true), READ_MS)
    return () => clearTimeout(a)
  }, [audio])

  useEffect(() => {
    if (!terminated) return undefined
    const b = setTimeout(() => setOffer(true), OFFER_MS)
    return () => clearTimeout(b)
  }, [terminated])

  const found = foundEndings(record).length

  if (terminated) {
    return (
      <div className="frame" data-size="narrow">
        <span className="frame-tag">closed</span>
        <div className="ending">
          <span className="terminated caret">session terminated.</span>
          {offer && (
            <button
              type="button"
              className="btn"
              data-variant="ghost"
              onClick={() => window.location.reload()}
            >
              it can be restored
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="frame" data-size="narrow">
      <span className="frame-tag">resolution</span>
      <div className="ending">
        <span className="ending-code">{ending.code}</span>
        <Scrambler as="h2" text={ending.name} speed={60} />
        <div className="ending-lines">
          {ending.lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
        <span className="counter">
          resolutions on file <b>{String(found).padStart(2, '0')}</b>
        </span>
      </div>
    </div>
  )
}
