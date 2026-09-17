import { useEffect, useRef } from 'react'
import { nextObservation, observationText } from '../core/observations.js'
import { useSystem } from '../state/SystemContext.jsx'
import { countSecrets } from '../core/secrets.js'

const EVALUATE_EVERY = 5_000
const WHISPER_MS = 7_000
/** Nothing is said for at least this long after the previous line. */
const QUIET_PERIOD = 25_000

export function useObserver(active) {
  const system = useSystem()
  const ref = useRef(system)
  ref.current = system
  const lastSpoke = useRef(0)

  useEffect(() => {
    if (!active) return undefined
    const id = setInterval(() => {
      const s = ref.current
      if (s.whisper) return
      if (Date.now() - lastSpoke.current < QUIET_PERIOD) return

      const clicks = Object.values(s.record.clicks)
      const ctx = {
        sessionTime: s.sessionTime,
        idleTime: s.idleTime,
        visits: s.record.visits,
        streak: s.record.streak,
        totalTime: s.record.totalTime,
        attempts: s.record.attempts,
        restored: s.record.restored,
        totalClicks: clicks.reduce((a, b) => a + b, 0),
        topButtonCount: clicks.length ? Math.max(...clicks) : 0,
        secrets: countSecrets(s.record),
        roomOpen: Boolean(s.record.room.opened),
      }

      const rule = nextObservation(ctx, s.record.observations)
      if (!rule) return
      lastSpoke.current = Date.now()
      s.actions.whisper(rule.id, observationText(rule, ctx))
    }, EVALUATE_EVERY)
    return () => clearInterval(id)
  }, [active])

  // Whispers fade on their own.
  useEffect(() => {
    if (!system.whisper) return undefined
    const id = setTimeout(() => ref.current.actions.clearWhisper(), WHISPER_MS)
    return () => clearTimeout(id)
  }, [system.whisper])
}

/** Fires once the pointer and keyboard have been quiet for `ms`. */
export function useStillness(ms, onStill, active = true) {
  const { idleTime } = useSystem()
  const fired = useRef(false)
  const cb = useRef(onStill)
  cb.current = onStill

  useEffect(() => {
    if (!active) return
    if (idleTime >= ms && !fired.current) {
      fired.current = true
      cb.current()
    }
    if (idleTime < 2000) fired.current = false
  }, [idleTime, ms, active])
}
