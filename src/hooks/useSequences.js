import { useEffect, useRef } from 'react'
import { useEvent } from '../state/SystemContext.jsx'

const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a',
]

/** Touch equivalent: the same shape, without the two letters. */
const KONAMI_SWIPE = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right']

const SWIPE_MIN = 28

/**
 * Konami code on a keyboard, or the same directional pattern drawn with
 * swipes on a touch screen.
 */
export function useKonami(onFound) {
  const found = useEvent(onFound)

  useEffect(() => {
    let keys = []
    const onKey = (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key
      keys = [...keys, k].slice(-KONAMI.length)
      if (keys.length === KONAMI.length && keys.every((v, i) => v === KONAMI[i])) {
        keys = []
        found()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [found])

  useEffect(() => {
    let swipes = []
    let start = null
    const onStart = (e) => {
      const t = e.changedTouches[0]
      start = { x: t.clientX, y: t.clientY }
    }
    const onEnd = (e) => {
      if (!start) return
      const t = e.changedTouches[0]
      const dx = t.clientX - start.x
      const dy = t.clientY - start.y
      start = null
      if (Math.abs(dx) < SWIPE_MIN && Math.abs(dy) < SWIPE_MIN) return
      const dir =
        Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'
      swipes = [...swipes, dir].slice(-KONAMI_SWIPE.length)
      if (swipes.length === KONAMI_SWIPE.length && swipes.every((v, i) => v === KONAMI_SWIPE[i])) {
        swipes = []
        found()
      }
    }
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchend', onEnd)
    }
  }, [found])
}

/** Listens for a word typed anywhere on the page, with no visible input. */
export function useTypedWord(word, onFound) {
  const found = useEvent(onFound)
  const target = word.toLowerCase()

  useEffect(() => {
    let buffer = ''
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return // the console handles its own
      if (e.key.length !== 1) return
      buffer = (buffer + e.key.toLowerCase()).slice(-target.length)
      if (buffer === target) {
        buffer = ''
        found()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [target, found])
}

/** Ctrl+Shift+I / Cmd+Alt+I. The browser may also act on it; that is the joke. */
export function useInspectCombo(onFound) {
  const found = useEvent(onFound)
  useEffect(() => {
    const onKey = (e) => {
      const letter = e.key?.toLowerCase()
      const combo =
        (e.ctrlKey && e.shiftKey && letter === 'i') || (e.metaKey && e.altKey && letter === 'i')
      if (combo) found()
      if (e.key === 'F12') found()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [found])
}

/** Records which notable keys the user has reached for. */
export function useKeyJournal(onKey) {
  const seen = useEvent(onKey)
  useEffect(() => {
    const watch = new Set(['Escape', 'Enter', 'Tab', ' ', 'Backspace', 'ArrowUp', 'ArrowDown'])
    const handler = (e) => {
      if (watch.has(e.key)) seen(e.key === ' ' ? 'Space' : e.key)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [seen])
}

/** A press-and-hold gesture, so keyboard-only secrets have a touch counterpart. */
export function useLongPress(onHold, ms = 1400) {
  const hold = useEvent(onHold)
  const timer = useRef(null)

  const clear = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }

  return {
    onPointerDown: () => {
      clear()
      timer.current = setTimeout(hold, ms)
    },
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
  }
}
