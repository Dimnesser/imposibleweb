export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

export const chance = (p) => Math.random() < p

export const between = (min, max) => min + Math.random() * (max - min)

/** Deterministic 32-bit hash — used to derive stable "identifiers" from a seed. */
export function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Small seeded generator so a session id renders the same on every re-render. */
export function seeded(seed) {
  let s = hash(String(seed)) || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    s >>>= 0
    return s / 4294967296
  }
}

const HEX = '0123456789ABCDEF'

export function sessionId() {
  let out = ''
  for (let i = 0; i < 8; i++) out += HEX[Math.floor(Math.random() * 16)]
  return `${out.slice(0, 4)}-${out.slice(4)}`
}

const GLYPHS = '!<>-_\\/[]{}—=+*^?#01ᚠᚢᚦᚨ█▓▒░'

/** One pass of character corruption over a string. */
export function corrupt(text, intensity = 0.2) {
  return text
    .split('')
    .map((ch) => (ch !== ' ' && Math.random() < intensity ? pick(GLYPHS.split('')) : ch))
    .join('')
}
