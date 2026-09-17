/** What the dashboard says to you, based on how many times you have been here. */
const LADDER = [
  { at: 1, line: 'Welcome.', sub: 'This is your first session. It will not be your last.' },
  { at: 2, line: "You're back.", sub: 'That was quicker than expected.' },
  { at: 3, line: "I knew you'd return.", sub: 'Statistically. Nothing personal.' },
  { at: 4, line: 'Again.', sub: 'The interface has started rounding your visits up.' },
  { at: 5, line: 'You are becoming a pattern.', sub: 'Patterns are easy to predict.' },
  { at: 7, line: 'Stop coming back.', sub: 'That was not a suggestion, but it was not an order either.' },
  { at: 10, line: 'This is not for you anymore.', sub: 'It stopped being for you around visit six.' },
  { at: 15, line: 'We should talk about the time you spend here.', sub: null },
]

export function greetingFor(visits) {
  let out = LADDER[0]
  for (const step of LADDER) if (visits >= step.at) out = step
  return out
}

export function awayLine(hours) {
  if (hours == null) return null
  if (hours < 0.05) return 'You refreshed. That does not reset anything.'
  if (hours < 1) return 'You were gone for a few minutes. It was noted.'
  if (hours < 24) return `Gone ${Math.round(hours)} hours. The session stayed open.`
  if (hours < 24 * 7) return `Gone ${Math.round(hours / 24)} days. Nothing was touched while you were away.`
  return 'You were gone a long time. Something used the session while you were out.'
}

export function formatDuration(ms) {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(sec)}`
}
