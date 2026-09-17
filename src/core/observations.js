/**
 * The "it is watching you" layer. Every rule reads exclusively from data the
 * page generated about itself — visit counts, click counts, elapsed time,
 * idle time. Nothing is sampled from the device.
 *
 * Rules are evaluated on a slow tick; the first matching rule that has not
 * already fired is delivered as a whisper.
 */

export const OBSERVATIONS = [
  {
    id: 'settle',
    cooldown: 0,
    when: (c) => c.sessionTime > 45_000 && c.sessionTime < 120_000,
    line: 'Still there?',
  },
  {
    id: 'long-haul',
    when: (c) => c.sessionTime > 300_000,
    line: 'You have been here five minutes. That is longer than most.',
  },
  {
    id: 'very-long-haul',
    when: (c) => c.sessionTime > 900_000,
    line: 'Fifteen minutes. You are not looking for anything specific, are you?',
  },
  {
    id: 'idle',
    when: (c) => c.idleTime > 40_000,
    line: 'Are you waiting for something?',
  },
  {
    id: 'idle-again',
    when: (c) => c.idleTime > 90_000,
    line: 'It waits better than you do.',
  },
  {
    id: 'favourite',
    when: (c) => c.topButtonCount >= 7,
    line: (c) => `You really like that button. ${c.topButtonCount} times now.`,
  },
  {
    id: 'returning',
    when: (c) => c.visits >= 2 && c.sessionTime > 12_000,
    line: 'Again?',
  },
  {
    id: 'frequent',
    when: (c) => c.visits >= 6,
    line: (c) => `${c.visits} sessions. The archive is running out of room.`,
  },
  {
    id: 'streak',
    when: (c) => c.streak >= 2,
    line: (c) => `${c.streak} days in a row. Someone is keeping count. It is this page.`,
  },
  {
    id: 'lifetime',
    when: (c) => c.totalTime > 600_000,
    line: 'You have now spent ten minutes of your life in here, total.',
  },
  {
    id: 'scratching',
    when: (c) => c.totalClicks >= 25,
    line: 'Pressing things faster does not open them sooner.',
  },
  {
    id: 'attempts',
    when: (c) => c.attempts >= 5,
    line: 'Five wrong answers. The lock is starting to enjoy this.',
  },
  {
    id: 'near-room',
    when: (c) => c.secrets >= 3 && !c.roomOpen,
    line: 'One more and the numbering will make sense.',
  },
  {
    id: 'restored',
    when: (c) => c.restored >= 1 && c.sessionTime > 8_000,
    line: 'The session was terminated. You restored it. That was your decision.',
  },
  {
    id: 'restored-twice',
    when: (c) => c.restored >= 3,
    line: 'You keep bringing it back. It has stopped asking why.',
  },
]

/** Returns the id of the next observation to deliver, or null. */
export function nextObservation(ctx, delivered) {
  const seen = new Set(delivered)
  for (const rule of OBSERVATIONS) {
    if (seen.has(rule.id)) continue
    if (rule.when(ctx)) return rule
  }
  return null
}

export const observationText = (rule, ctx) =>
  typeof rule.line === 'function' ? rule.line(ctx) : rule.line
