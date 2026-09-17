import { createContext, useContext, useEffect, useMemo, useRef } from 'react'
import { AtmosphereEngine } from '../audio/engine.js'
import { useSystem } from '../state/SystemContext.jsx'

const AudioCtx = createContext(null)

export function AudioProvider({ children }) {
  const engine = useRef(null)
  if (!engine.current) engine.current = new AtmosphereEngine()
  const { record, glitch } = useSystem()
  const on = record.sound

  useEffect(() => {
    const e = engine.current
    if (on) e.start()
    else e.stop()
  }, [on])

  useEffect(() => () => engine.current?.dispose(), [])

  // The room tone reacts to instability, not to anything outside the page.
  useEffect(() => {
    if (on && glitch) engine.current.burst(glitch.kind === 'invert' ? 90 : 220)
  }, [glitch, on])

  const value = useMemo(
    () => ({
      blip: (kind) => engine.current?.blip(kind),
      burst: (ms) => engine.current?.burst(ms),
    }),
    [],
  )

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>
}

export function useAudio() {
  return useContext(AudioCtx) ?? { blip: () => {}, burst: () => {} }
}
