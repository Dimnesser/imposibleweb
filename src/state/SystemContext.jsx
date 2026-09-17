import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react'
import { loadRecord, saveRecord, wipeRecord, blankRecord, hoursAway } from '../core/storage.js'
import { sessionId as makeSessionId } from '../core/random.js'
import { initState, reducer, SCREENS } from './reducer.js'

const SystemContext = createContext(null)

const TICK_MS = 1000

export function SystemProvider({ children }) {
  const bootRef = useRef(null)
  if (!bootRef.current) {
    const record = loadRecord()
    bootRef.current = {
      record,
      away: hoursAway(record),
      sessionId: makeSessionId(),
      now: Date.now(),
    }
  }

  const [state, dispatch] = useReducer(reducer, bootRef.current, initState)

  // --- persistence -------------------------------------------------------
  const recordRef = useRef(state.record)
  recordRef.current = state.record
  useEffect(() => {
    const id = setTimeout(() => saveRecord(state.record), 250)
    return () => clearTimeout(id)
  }, [state.record])

  // Flush on the way out so the final seconds of the session survive.
  useEffect(() => {
    const flush = () => saveRecord(recordRef.current)
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', flush)
      flush()
    }
  }, [])

  // --- session clock -----------------------------------------------------
  useEffect(() => {
    let last = Date.now()
    const id = setInterval(() => {
      const now = Date.now()
      const delta = Math.min(now - last, TICK_MS * 4) // ignore tab-sleep gaps
      last = now
      if (document.visibilityState === 'visible') dispatch({ type: 'tick', delta })
    }, TICK_MS)
    return () => clearInterval(id)
  }, [])

  // --- activity / idle ---------------------------------------------------
  useEffect(() => {
    const wake = () => dispatch({ type: 'activity' })
    const opts = { passive: true }
    const events = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll']
    events.forEach((e) => window.addEventListener(e, wake, opts))
    return () => events.forEach((e) => window.removeEventListener(e, wake, opts))
  }, [])

  // --- motion preference -------------------------------------------------
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => dispatch({ type: 'reduce-motion', on: mq.matches })
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const actions = useMemo(
    () => ({
      enter: () => dispatch({ type: 'enter' }),
      booted: () => dispatch({ type: 'booted' }),
      navigate: (screen) => dispatch({ type: 'navigate', screen }),
      press: (id) => dispatch({ type: 'press', id }),
      exitPress: () => dispatch({ type: 'exit-press' }),
      keySeen: (key) => dispatch({ type: 'key-seen', key }),
      secret: (id) => dispatch({ type: 'secret', id }),
      clearToast: (id) => dispatch({ type: 'clear-toast', id }),
      whisper: (id, text) => dispatch({ type: 'whisper', id, text }),
      clearWhisper: () => dispatch({ type: 'clear-whisper' }),
      glitch: (glitch) => dispatch({ type: 'glitch', glitch }),
      clearGlitch: () => dispatch({ type: 'clear-glitch' }),
      openRoom: () => dispatch({ type: 'open-room' }),
      solveLock: (lock) => dispatch({ type: 'lock-solved', lock }),
      attempt: () => dispatch({ type: 'attempt' }),
      reachEnding: (id) => dispatch({ type: 'ending', id }),
      setSound: (on) => dispatch({ type: 'sound', on }),
      dismissRestore: () => dispatch({ type: 'dismiss-restore' }),
      reset: () => {
        wipeRecord()
        dispatch({ type: 'reset', record: blankRecord() })
      },
    }),
    [],
  )

  const value = useMemo(
    () => ({ ...state, away: bootRef.current.away, actions, dispatch }),
    [state, actions],
  )

  return <SystemContext.Provider value={value}>{children}</SystemContext.Provider>
}

export function useSystem() {
  const ctx = useContext(SystemContext)
  if (!ctx) throw new Error('useSystem must be used inside <SystemProvider>')
  return ctx
}

export { SCREENS }

/** Stable callback helper used by the detector hooks. */
export function useEvent(fn) {
  const ref = useRef(fn)
  ref.current = fn
  return useCallback((...args) => ref.current(...args), [])
}
