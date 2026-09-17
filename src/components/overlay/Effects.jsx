import { useMemo } from 'react'
import { useSystem } from '../../state/SystemContext.jsx'
import { useGlitchClass } from '../../hooks/useGlitchEngine.js'

/** Filler for the interface that is not supposed to be this one. */
function otherInterface(seed) {
  const rows = []
  for (let i = 0; i < 40; i++) {
    rows.push(
      `${String(i).padStart(3, '0')}  ${(seed * (i + 7)).toString(16).toUpperCase().slice(0, 8).padEnd(8, '0')}  ` +
        `${i % 3 === 0 ? 'OCCUPANT' : i % 3 === 1 ? 'ROOM' : 'RECORD'} ${String((i * 37) % 99).padStart(2, '0')}  ` +
        `${i % 7 === 0 ? 'HELD' : 'OK'}`,
    )
  }
  return rows.join('\n')
}

export function Effects() {
  const { glitch, reduceMotion } = useSystem()
  useGlitchClass(glitch)

  const dump = useMemo(() => otherInterface(Math.floor(Math.random() * 9999) + 3), [glitch?.at])

  return (
    <>
      <div className="fx fx-bloom" aria-hidden="true" />
      {!reduceMotion && <div className="fx fx-scan" aria-hidden="true" />}
      {!reduceMotion && <div className="fx fx-noise" aria-hidden="true" />}
      <div className="fx fx-vignette" aria-hidden="true" />
      {glitch?.kind === 'other' && (
        <div className="fx-other" aria-hidden="true">
          <span className="fx-other-head">occupant ledger — not this session</span>
          <pre>{dump}</pre>
        </div>
      )}
    </>
  )
}
