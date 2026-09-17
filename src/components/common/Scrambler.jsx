import { useEffect, useRef, useState } from 'react'
import { corrupt } from '../../core/random.js'

/**
 * Resolves into its text one character at a time, through noise.
 * Used for headings that appear rather than simply render.
 */
export function Scrambler({ text, speed = 28, className = '', as: Tag = 'span' }) {
  const [out, setOut] = useState(text)
  const frame = useRef(0)

  useEffect(() => {
    let raf
    let i = 0
    const start = performance.now()
    const tick = (now) => {
      const elapsed = now - start
      i = Math.floor(elapsed / speed)
      if (i >= text.length) {
        setOut(text)
        return
      }
      setOut(text.slice(0, i) + corrupt(text.slice(i), 0.85))
      frame.current += 1
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [text, speed])

  return <Tag className={className}>{out}</Tag>
}
