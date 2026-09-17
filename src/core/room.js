import { normalise, rot } from './cipher.js'

/** The plaintext behind LOCK I. Shown ciphered; solved by typing the last word. */
const LOCK_I_PLAIN = 'THE ANSWER IS MIRROR'

export const LOCK_I_CIPHER = rot(LOCK_I_PLAIN, 13)

export const GLYPHS = ['◈', '▭', '◉', '△']

/** Order the glyph rail must be tapped in, expressed as 1-based indices. */
export const GLYPH_VECTOR = [3, 1, 4, 2]

export const LOCKS = [
  {
    id: 'cipher',
    title: 'LOCK I',
    kind: 'text',
    question: 'the wall says something. say it back, in one word.',
    /** The answer is the final word of the deciphered line. */
    check: (input) => normalise(input) === 'mirror',
    solved: 'THE MIRROR WAS NEVER THE EXIT.',
  },
  {
    id: 'count',
    title: 'LOCK II',
    kind: 'text',
    question: 'how many times have you been here?',
    /** Only the user's own visit count opens it. The dashboard already said it. */
    check: (input, ctx) => Number(normalise(input)) === ctx.visits,
    solved: 'CORRECT. IT HAS BEEN COUNTING SINCE BEFORE YOU NOTICED.',
  },
  {
    id: 'vector',
    title: 'LOCK III',
    kind: 'glyph',
    question: 'the wall gave you an order. use it.',
    solved: 'THE SEQUENCE HOLDS. SOMETHING BEHIND THE WALL STOPPED MOVING.',
  },
]

export const LOCK_IDS = LOCKS.map((l) => l.id)
export const allLocksSolved = (solved) => LOCK_IDS.every((id) => solved.includes(id))

/** Atmospheric filler that scrolls in the room's message column. */
export const ROOM_MESSAGES = [
  'ROOM 07 // PRESSURE NOMINAL // OCCUPANCY 1',
  'the previous occupant left the lights on.',
  'COORD 07°00′00″N 000°07′00″W',
  'do not write down what you read here.',
  'SIGNAL FROM ROOM 06: [no rooms are missing]',
  'SIGNAL FROM ROOM 08: [██████]',
  'the timer is not counting down to anything.',
  'A = N',
  'if you are reading this, the door is already behind you.',
  'INDEX OF ROOMS: 01 02 03 04 05 06 07 __',
]
