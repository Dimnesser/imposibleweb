import { useEffect, useRef } from 'react'
import { between, chance, pick } from '../core/random.js'
import { useSystem } from '../state/SystemContext.jsx'

/**
 * Each entry is a way the interface can briefly stop behaving. `weight` keeps
 * the loud ones rare; `ms` keeps all of them short enough to doubt.
 */
const KINDS = [
  { kind: 'flicker', weight: 5, ms: [90, 260] },
  { kind: 'scramble', weight: 4, ms: [280, 900] },
  { kind: 'shift', weight: 4, ms: [120, 340] },
  { kind: 'vanish', weight: 3, ms: [200, 700] },
  { kind: 'cursor', weight: 2, ms: [900, 2200] },
  { kind: 'invert', weight: 1, ms: [70, 150] },
  { kind: 'other', weight: 1, ms: [420, 1000] },
]

const TOTAL_WEIGHT = KINDS.reduce((n, k) => n + k.weight, 0)

function rollKind() {
  let n = Math.random() * TOTAL_WEIGHT
  for (const k of KINDS) {
    n -= k.weight
    if (n <= 0) return k
  }
  return KINDS[0]
}

/** Seconds between attempts; each attempt only sometimes becomes a glitch. */
const MIN_GAP = 26_000
const MAX_GAP = 78_000

export function useGlitchEngine(active) {
  const { actions, reduceMotion, record } = useSystem()
  const timer = useRef(null)
  const actionsRef = useRef(actions)
  actionsRef.current = actions

  // The longer the history, the slightly less stable the interface becomes.
  const instability = Math.min(0.35 + Object.keys(record.secrets).length * 0.05, 0.75)

  useEffect(() => {
    if (!active || reduceMotion) return undefined

    let cancelled = false

    const schedule = () => {
      if (cancelled) return
      timer.current = setTimeout(() => {
        if (cancelled) return
        if (chance(instability)) {
          const k = rollKind()
          const duration = between(k.ms[0], k.ms[1])
          actionsRef.current.glitch({ kind: k.kind, at: Date.now(), duration })
          setTimeout(() => {
            if (!cancelled) actionsRef.current.clearGlitch()
          }, duration)
        }
        schedule()
      }, between(MIN_GAP, MAX_GAP))
    }

    schedule()
    return () => {
      cancelled = true
      if (timer.current) clearTimeout(timer.current)
    }
  }, [active, reduceMotion, instability])
}

/** Applies the current glitch to the document root so CSS can react globally. */
export function useGlitchClass(glitch) {
  useEffect(() => {
    const el = document.documentElement
    if (!glitch) {
      el.removeAttribute('data-glitch')
      return undefined
    }
    el.setAttribute('data-glitch', glitch.kind)
    return () => el.removeAttribute('data-glitch')
  }, [glitch])
}

/** A handful of words the interface sometimes gets wrong. */
const SUBSTITUTIONS = {
  SESSION: 'SUBJECT',
  STATUS: 'CONDITION',
  USER: 'OCCUPANT',
  GUEST: 'SPECIMEN',
  CONTINUE: 'COMPLY',
  SETTINGS: 'RESTRAINTS',
  ARCHIVE: 'EVIDENCE',
  EXIT: 'DON’T',
  TIME: 'REMAINING',
  UNKNOWN: 'WITHHELD',
}

export function misword(text, glitch) {
  if (!glitch || glitch.kind !== 'scramble') return text
  return SUBSTITUTIONS[text] ?? text
}

export { pick }
