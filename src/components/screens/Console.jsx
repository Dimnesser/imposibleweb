import { useState } from 'react'
import { normalise } from '../../core/cipher.js'

/**
 * A single-line input. It is the touch-friendly route to anything the desktop
 * version hides behind a key combination.
 */
export function Console({ prompt = '>', placeholder = '', onSubmit, autoFocus = false }) {
  const [value, setValue] = useState('')

  return (
    <form
      className="console"
      onSubmit={(e) => {
        e.preventDefault()
        const raw = value.trim()
        if (!raw) return
        setValue('')
        onSubmit(raw, normalise(raw))
      }}
    >
      <span className="console-prompt">{prompt}</span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        spellCheck="false"
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        aria-label="command input"
        autoFocus={autoFocus}
      />
      <button type="submit" className="sr">
        submit
      </button>
    </form>
  )
}
