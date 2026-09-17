/** Puzzle primitives for ROOM 07. Deliberately weak — they are meant to be solved. */

export function rot(text, n = 13) {
  return text.replace(/[a-z]/gi, (c) => {
    const base = c <= 'Z' ? 65 : 97
    return String.fromCharCode(((c.charCodeAt(0) - base + n + 26) % 26) + base)
  })
}

export function normalise(input) {
  return String(input).trim().toLowerCase().replace(/[^a-z0-9]/g, '')
}

/** Renders a number as the block-glyph "tally" used on the ROOM 07 walls. */
export function tally(n) {
  const full = '█'.repeat(Math.floor(n / 5))
  const rest = '▌'.repeat(n % 5)
  return full + rest || '·'
}
