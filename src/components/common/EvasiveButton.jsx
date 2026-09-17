import { useCallback, useRef, useState } from 'react'

/**
 * A button you can always press, but never quite cleanly. It nudges away from
 * the pointer and settles back; on touch devices the drift happens after the
 * press instead, so a tap always lands.
 */
export function EvasiveButton({
  children,
  onClick,
  range = 14,
  variant = 'primary',
  className = '',
  ...rest
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const settle = useRef(null)

  const drift = useCallback(
    (e) => {
      const el = e.currentTarget
      const box = el.getBoundingClientRect()
      const cx = box.left + box.width / 2
      const cy = box.top + box.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.hypot(dx, dy) || 1
      // Push away from the pointer, strongest near the centre.
      const force = Math.max(0, 1 - dist / (box.width * 0.9))
      setOffset({
        x: (-dx / dist) * range * force,
        y: (-dy / dist) * range * force,
      })
      if (settle.current) clearTimeout(settle.current)
      settle.current = setTimeout(() => setOffset({ x: 0, y: 0 }), 900)
    },
    [range],
  )

  return (
    <button
      type="button"
      className={`btn evasive ${className}`.trim()}
      data-variant={variant}
      style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
      onPointerMove={(e) => e.pointerType === 'mouse' && drift(e)}
      onPointerLeave={() => setOffset({ x: 0, y: 0 })}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  )
}
